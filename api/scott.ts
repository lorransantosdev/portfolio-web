import { ScottLang, ScottMode, systemPrompt } from './_scott-prompt';

declare const process: { env: Record<string, string | undefined> };

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-haiku-5-5';
const MAX_TOKENS = 300;
const TIMEOUT_MS = 15_000;
const MAX_QUESTION = 500;

const WINDOW_MS = 10 * 60_000;
const LIMIT = 10;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  return list.length > LIMIT;
}

function fail(status: number, error: string): Response {
  return new Response(JSON.stringify({ error, fallback: 'faq' }), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export async function POST(request: Request): Promise<Response> {
  const key = process.env['ANTHROPIC_API_KEY'];
  if (process.env['SCOTT_AI_ENABLED'] !== 'true' || !key) return fail(503, 'disabled');

  const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) return fail(429, 'rate_limited');

  let body: { question?: unknown; lang?: unknown; mode?: unknown };
  try {
    body = await request.json();
  } catch {
    return fail(400, 'bad_json');
  }
  const question = typeof body.question === 'string' ? body.question.trim() : '';
  const lang: ScottLang = body.lang === 'en' ? 'en' : 'pt';
  const mode: ScottMode = body.mode === 'rh' ? 'rh' : 'tec';
  if (!question || question.length > MAX_QUESTION) return fail(400, 'bad_question');

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  let upstream: Response;
  try {
    upstream = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env['ANTHROPIC_MODEL'] || DEFAULT_MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt(lang, mode),
        messages: [{ role: 'user', content: question }],
        stream: true,
      }),
    });
  } catch {
    clearTimeout(timer);
    return fail(504, 'upstream_timeout');
  }
  if (!upstream.ok || !upstream.body) {
    clearTimeout(timer);
    return fail(upstream.status === 429 ? 429 : 502, 'upstream_error');
  }

  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';
  const stream = upstream.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          try {
            const evt = JSON.parse(line.slice(5).trim());
            if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
              controller.enqueue(encoder.encode(evt.delta.text));
            }
          } catch {
          }
        }
      },
      flush() {
        clearTimeout(timer);
      },
    }),
  );

  return new Response(stream, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}

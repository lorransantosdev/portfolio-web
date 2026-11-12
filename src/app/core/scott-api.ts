import { Injectable } from '@angular/core';
import { Lang } from '../content/types';

export const SCOTT_AI_ENABLED = false;

export type ScottMode = 'tec' | 'rh';

@Injectable({ providedIn: 'root' })
export class ScottApiService {
  async ask(
    question: string,
    lang: Lang,
    mode: ScottMode,
    onText?: (text: string) => void,
    timeoutMs = 20_000,
  ): Promise<string | null> {
    if (!SCOTT_AI_ENABLED) return null;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch('/api/scott', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question, lang, mode }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) return null;
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let text = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        text += dec.decode(value, { stream: true });
        onText?.(text);
      }
      return text.trim() || null;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
}

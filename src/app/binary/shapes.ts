
export type ShapeName =
  | 'queijo'
  | 'anel'
  | 'trofeu'
  | 'cartao'
  | 'carro'
  | 'faisca'
  | 'arroba'
  | 'pata'
  | 'envelope';

type Draw = (x: CanvasRenderingContext2D, W: number, H: number) => void;

export const FONT_MONO = '"Geist Mono Variable", "Geist Mono", ui-monospace, monospace';
export const FONT_SANS = '"Geist Variable", Geist, Arial, sans-serif';
export const GLYPH_FONT = `500 9px ${FONT_MONO}`;
export const GLYPH_FONT_RED = `600 9px ${FONT_MONO}`;
export const RED = '#d91d04';

export const SH: Record<ShapeName, Draw> = {
  queijo(x, W, H) {
    x.beginPath(); x.moveTo(W * .06, H * .86); x.lineTo(W * .94, H * .86); x.lineTo(W * .94, H * .42); x.lineTo(W * .06, H * .7); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(W * .06, H * .7); x.lineTo(W * .94, H * .42); x.lineTo(W * .7, H * .14); x.closePath(); x.globalAlpha = .55; x.fill(); x.globalAlpha = 1;
    x.globalCompositeOperation = 'destination-out';
    ([[.3, .76, .07], [.55, .68, .05], [.78, .74, .06], [.7, .3, .04]] as const).forEach(([a, b, r]) => { x.beginPath(); x.arc(W * a, H * b, H * r * 1.4, 0, 7); x.fill(); });
  },
  anel(x, W, H) {
    x.lineWidth = H * .1; x.beginPath(); x.ellipse(W / 2, H * .64, W * .3, H * .28, 0, 0, 7); x.stroke();
    x.beginPath(); x.moveTo(W / 2, H * .06); x.lineTo(W * .64, H * .2); x.lineTo(W / 2, H * .38); x.lineTo(W * .36, H * .2); x.closePath(); x.fill();
  },
  trofeu(x, W, H) {
    x.beginPath(); x.moveTo(W * .22, H * .08); x.lineTo(W * .78, H * .08); x.quadraticCurveTo(W * .78, H * .56, W / 2, H * .58); x.quadraticCurveTo(W * .22, H * .56, W * .22, H * .08); x.fill();
    x.lineWidth = W * .06; x.beginPath(); x.arc(W * .2, H * .24, W * .12, Math.PI * .5, Math.PI * 1.5); x.stroke();
    x.beginPath(); x.arc(W * .8, H * .24, W * .12, -Math.PI * .5, Math.PI * .5); x.stroke();
    x.fillRect(W * .45, H * .56, W * .1, H * .2); x.fillRect(W * .28, H * .76, W * .44, H * .1); x.fillRect(W * .2, H * .86, W * .6, H * .08);
  },
  cartao(x, W, H) {
    const r = 22; x.lineWidth = 7; x.beginPath();
    if (x.roundRect) x.roundRect(6, 6, W - 12, H - 12, r); else x.rect(6, 6, W - 12, H - 12);
    x.stroke(); x.fillRect(W * .09, H * .3, W * .14, H * .2); x.lineWidth = 4;
    for (let k = 0; k < 3; k++) { x.beginPath(); x.arc(W * .3, H * .4, 10 + k * 9, -.8, .8); x.stroke(); }
    for (let k = 0; k < 4; k++) for (let j = 0; j < 4; j++) { x.beginPath(); x.arc(W * .1 + k * W * .2 + j * 13, H * .66, 3.5, 0, 7); x.fill(); }
    x.fillRect(W * .09, H * .8, W * .32, 5);
    x.globalAlpha = .9; x.beginPath(); x.arc(W * .78, H * .8, H * .08, 0, 7); x.fill();
    x.globalAlpha = .55; x.beginPath(); x.arc(W * .85, H * .8, H * .08, 0, 7); x.fill(); x.globalAlpha = 1;
  },
  carro(x, W, H) {
    x.save(); x.scale(W / 620, H / 270); x.translate(10, -100);
    x.beginPath(); x.moveTo(70, 330); x.lineTo(80, 270); x.quadraticCurveTo(110, 250, 170, 245); x.lineTo(240, 180); x.quadraticCurveTo(260, 165, 300, 165); x.lineTo(420, 165); x.quadraticCurveTo(450, 165, 470, 185); x.lineTo(530, 245); x.quadraticCurveTo(580, 252, 580, 290); x.lineTo(575, 330); x.closePath(); x.fill();
    x.globalCompositeOperation = 'destination-out';
    x.beginPath(); x.moveTo(255, 240); x.lineTo(300, 192); x.lineTo(345, 192); x.lineTo(345, 240); x.closePath(); x.fill();
    x.beginPath(); x.moveTo(365, 240); x.lineTo(365, 192); x.lineTo(420, 192); x.lineTo(465, 240); x.closePath(); x.fill();
    x.beginPath(); x.arc(185, 335, 46, 0, 7); x.arc(470, 335, 46, 0, 7); x.fill();
    x.globalCompositeOperation = 'source-over';
    x.beginPath(); x.arc(185, 335, 36, 0, 7); x.fill(); x.beginPath(); x.arc(470, 335, 36, 0, 7); x.fill();
    x.restore();
  },
  faisca(x, W, H) {
    const st = (cx: number, cy: number, R: number) => {
      x.beginPath(); x.moveTo(cx, cy - R); x.quadraticCurveTo(cx, cy, cx + R, cy); x.quadraticCurveTo(cx, cy, cx, cy + R); x.quadraticCurveTo(cx, cy, cx - R, cy); x.quadraticCurveTo(cx, cy, cx, cy - R); x.fill();
    };
    st(W * .45, H * .55, W * .4); st(W * .82, H * .2, W * .15);
  },
  arroba(x, W, H) {
    x.font = '500 ' + (H * .95).toFixed(0) + 'px ' + FONT_SANS; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('@', W / 2, H * .53);
  },
  pata(x, W, H) {
    x.beginPath(); x.ellipse(W / 2, H * .66, W * .24, H * .2, 0, 0, 7); x.fill();
    ([[.2, .38], [.4, .2], [.6, .2], [.8, .38]] as const).forEach(([a, b]) => { x.beginPath(); x.ellipse(W * a, H * b, W * .1, H * .13, 0, 0, 7); x.fill(); });
  },
  envelope(x, W, H) {
    x.lineWidth = 7; x.strokeRect(8, 8, W - 16, H - 16); x.beginPath(); x.moveTo(8, 10); x.lineTo(W / 2, H * .6); x.lineTo(W - 8, 10); x.stroke();
  },
};

export interface BinCell {
  hx: number;
  hy: number;
  a: number;
}

export function sampleBin(shape: ShapeName, W: number, H: number): BinCell[] {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d', { willReadFrequently: true })!;
  x.fillStyle = '#fff'; x.strokeStyle = '#fff';
  (SH[shape] || SH.faisca)(x, W, H);
  const d = x.getImageData(0, 0, W, H).data;
  const out: BinCell[] = [];
  const cw = 7, ch = 9;
  for (let yy = 0; yy + ch <= H; yy += ch) {
    for (let xx = 0; xx + cw <= W; xx += cw) {
      let a = 0;
      for (let j = 0; j < ch; j += 3) for (let i = 0; i < cw; i += 2) a += d[((yy + j) * W + xx + i) * 4 + 3];
      a = a / (Math.ceil(ch / 3) * Math.ceil(cw / 2) * 255);
      if (a > .2) out.push({ hx: xx + cw / 2, hy: yy + ch / 2, a: Math.min(1, .35 + a * .75) });
    }
  }
  return out;
}

export type Glyphs = Record<'0' | '1', HTMLCanvasElement>;
const cache = new Map<string, Glyphs>();

export function GL(col: string, font: string): Glyphs {
  const k = col + '|' + font;
  const hit = cache.get(k);
  if (hit) return hit;
  const o = {} as Glyphs;
  (['0', '1'] as const).forEach((dg) => {
    const c = document.createElement('canvas');
    c.width = c.height = 32;
    const x = c.getContext('2d')!;
    x.scale(2, 2); x.font = font; x.fillStyle = col; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(dg, 8, 8);
    o[dg] = c;
  });
  cache.set(k, o);
  return o;
}

let fontsPromise: Promise<void> | null = null;
export function fontsReady(): Promise<void> {
  if (fontsPromise) return fontsPromise;
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  if (!fonts || !fonts.load) return (fontsPromise = Promise.resolve());
  const loads = Promise.all([
    fonts.load(GLYPH_FONT, '01'),
    fonts.load(GLYPH_FONT_RED, '01'),
    fonts.load(`500 120px ${FONT_SANS}`, '@'),
  ]).then(() => undefined, () => undefined);
  const timeout = new Promise<void>((r) => setTimeout(r, 2500));
  return (fontsPromise = Promise.race([loads, timeout]));
}

export const dprCap = (): number => Math.min(window.devicePixelRatio || 1, 2);

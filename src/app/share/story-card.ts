import { QR_ROWS, STORY_FACE } from './share-data';

export interface StoryText {
  kicker: string;
  line1: string;
  line2: string;
  em: string;
  cta: string;
  url: string;
  tag: string;
}

const RED = '#d91d04';
const CREAM = '#f9f2ea';
const SERIF = "'Instrument Serif', Georgia, serif";
const MONO = "'Geist Mono Variable', 'Geist Mono', ui-monospace, monospace";
const SANS = "'Geist Variable', Geist, system-ui, sans-serif";

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

export function drawQr(g: CanvasRenderingContext2D, x: number, y: number, size: number, logo: HTMLImageElement | null): void {
  const n = QR_ROWS.length, cell = size / n, mid = (n - 1) / 2;
  const finder = (r: number, c: number) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
  QR_ROWS.forEach((row, r) => {
    for (let c = 0; c < n; c++) {
      if (row[c] !== '1' || (Math.abs(r - mid) <= 4 && Math.abs(c - mid) <= 4)) continue;
      g.fillStyle = finder(r, c) ? RED : '#000';
      g.fillRect(x + c * cell, y + r * cell, cell + .5, cell + .5);
    }
  });
  if (logo) {
    const l = cell * 7.4;
    g.drawImage(logo, x + size / 2 - l / 2, y + size / 2 - l / 2, l, l);
  }
}

// Desenha o card 1080×1920. O layout é pensado em 540×960 e escalado.
export async function renderStory(text: StoryText): Promise<HTMLCanvasElement> {
  const k = 2, W = 540, H = 960;
  const cv = document.createElement('canvas');
  cv.width = W * k; cv.height = H * k;
  const g = cv.getContext('2d')!;
  g.scale(k, k);

  try { await document.fonts.ready; } catch { /* segue com fallback */ }
  const logo = await loadImage('/logo.svg');

  g.fillStyle = '#000';
  g.fillRect(0, 0, W, H);

  const cw = 4.6, ch = 5.5, ox = 270 - 53 * cw, oy = 66;
  g.font = `700 6.4px ${MONO}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  STORY_FACE.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      if (row[c] === ' ') continue;
      const v = +row[c] / 9;
      g.globalAlpha = .05 + Math.pow(v, 1.5) * .95;
      g.fillStyle = Math.random() < .06 ? RED : CREAM;
      g.fillText(Math.random() < .5 ? '0' : '1', ox + c * cw + cw / 2, oy + r * ch + ch / 2);
    }
  });
  g.globalAlpha = 1;

  const fade = g.createLinearGradient(0, 0, 0, H);
  fade.addColorStop(.5, 'rgba(0,0,0,0)');
  fade.addColorStop(.59, 'rgba(0,0,0,.85)');
  fade.addColorStop(.63, '#000');
  g.fillStyle = fade;
  g.fillRect(0, 0, W, H);

  g.textAlign = 'left';
  g.textBaseline = 'alphabetic';
  if (logo) g.drawImage(logo, 36, 34, 28, 28);
  g.fillStyle = CREAM;
  g.font = `600 18px ${SANS}`;
  g.fillText('lorran', 74, 54);
  g.textAlign = 'right';
  g.font = `400 11px ${MONO}`;
  g.fillStyle = 'rgba(249,242,234,.6)';
  g.fillText('01001100 · sp', W - 36, 52);

  g.textAlign = 'left';
  g.fillStyle = '#ff8a73';
  g.font = `400 12px ${MONO}`;
  g.fillText(text.kicker, 36, 600);

  g.fillStyle = CREAM;
  g.font = `400 50px ${SERIF}`;
  g.fillText(text.line1, 36, 652);
  g.fillText(text.line2, 36, 701);
  let x = 36 + g.measureText(text.line2).width;
  g.font = `italic 400 50px ${SERIF}`;
  g.fillStyle = RED;
  g.fillText(text.em, x, 701);
  x += g.measureText(text.em).width;
  g.font = `400 50px ${SERIF}`;
  g.fillStyle = CREAM;
  g.fillText('.', x, 701);

  const qs = 136, pad = 14, by = H - 40 - (qs + pad * 2);
  g.fillStyle = CREAM;
  roundRect(g, 36, by, qs + pad * 2, qs + pad * 2, 20);
  g.fill();
  drawQr(g, 36 + pad, by + pad, qs, logo);

  const tx = 36 + qs + pad * 2 + 20, cy = by + (qs + pad * 2) / 2;
  g.fillStyle = '#ff8a73';
  g.font = `400 11px ${MONO}`;
  g.fillText(text.cta, tx, cy - 22);
  g.fillStyle = CREAM;
  g.font = `400 17px ${MONO}`;
  g.fillText(text.url, tx, cy + 4);
  g.fillStyle = 'rgba(249,242,234,.6)';
  g.font = `400 13px ${SANS}`;
  g.fillText(text.tag, tx, cy + 30);

  return cv;
}

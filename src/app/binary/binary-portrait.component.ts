import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { MotionService } from '../core/motion.service';
import { FACE_GRID } from './face-grid';
import { GL, GLYPH_FONT, GLYPH_FONT_RED, RED, dprCap, fontsReady } from './shapes';

const CW = 7, CH = 8, FW = 700, FH = 648;

interface Cell {
  hx: number; hy: number; x: number; y: number; vx: number; vy: number;
  a: number; d: '0' | '1'; delay: number;
  st: number;
}

@Component({
  selector: 'app-binary-portrait',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #cv role="img" [attr.aria-label]="label()"></canvas>`,
  styles: `
    :host { display: block; }
    canvas { width: 100%; aspect-ratio: 700 / 648; display: block; cursor: crosshair; touch-action: pan-y; }
  `,
})
export class BinaryPortraitComponent {
  readonly label = input.required<string>();
  private cv = viewChild.required<ElementRef<HTMLCanvasElement>>('cv');
  private motion = inject(MotionService);
  private destroyRef = inject(DestroyRef);
  private destroyed = false;

  constructor() {
    this.destroyRef.onDestroy(() => (this.destroyed = true));
    afterNextRender(() => {
      fontsReady().then(() => !this.destroyed && this.init());
    });
  }

  private init(): void {
    const cv = this.cv().nativeElement;
    const dpr = dprCap(), reduce = this.motion.reduced;
    cv.width = FW * dpr; cv.height = FH * dpr;
    const ctx = cv.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const GB = GL('#000000', GLYPH_FONT), GR = GL(RED, GLYPH_FONT_RED);

    const cells: Cell[] = [];
    const cx = FW / 2, cy = FH * .35;
    FACE_GRID.forEach((row, r) => {
      for (let k = 0; k < row.length; k++) {
        const ch = row[k];
        if (ch === ' ') continue;
        const hx = k * CW + CW / 2, hy = r * CH + CH / 2;
        cells.push({
          hx, hy, x: hx, y: hy, vx: 0, vy: 0, a: +ch / 9,
          d: Math.random() < .5 ? '0' : '1',
          delay: Math.hypot(hx - cx, hy - cy) / 520 + Math.random() * .35,
          st: 0,
        });
      }
    });

    const m = { x: -999, y: -999, in: false };
    let kicked = 0, lastFlip = 0, dirty = false, pending = cells.length;
    const t0 = performance.now();
    const STEPS = 6; // a entrada de cada dígito é quantizada em 6 passos de opacidade

    const clearBox = (q: Cell) => ctx.clearRect(q.hx - CW / 2, q.hy - CH / 2, CW, CH);
    const put = (q: Cell, red: boolean, alpha: number) => {
      ctx.globalAlpha = alpha;
      ctx.drawImage((red ? GR : GB)[q.d], q.x - 8, q.y - 8, 16, 16);
    };
    const showOf = (q: Cell, el: number) => (reduce ? 1 : Math.min(1, Math.max(0, (el - q.delay) / .35)));

    const full = (el: number, steps: number) => {
      ctx.clearRect(0, 0, FW, FH);
      const R2 = 5200;
      for (let i = 0; i < cells.length; i++) {
        const q = cells[i];
        const show = showOf(q, el);
        q.st = show >= 1 ? STEPS : Math.floor(show * STEPS);
        if (show <= 0) continue;
        for (let s = 0; s < steps; s++) {
          q.vx += (q.hx - q.x) * .09; q.vy += (q.hy - q.y) * .09;
          if (m.in) {
            const dx = q.x - m.x, dy = q.y - m.y, dd = dx * dx + dy * dy;
            if (dd < R2) { const f = (R2 - dd) / R2 * 2.4, r = Math.sqrt(dd) || 1; q.vx += dx / r * f; q.vy += dy / r * f; }
          }
          q.vx *= .78; q.vy *= .78; q.x += q.vx; q.y += q.vy;
        }
        if (steps && Math.random() < .01) q.d = q.d === '0' ? '1' : '0';
        const moving = Math.abs(q.vx) + Math.abs(q.vy) > 1.2 || show < 1;
        put(q, moving, moving ? Math.max(.55, q.a) * show : q.a);
      }
      ctx.globalAlpha = 1;
    };

    const intro = (el: number) => {
      for (let i = 0; i < cells.length; i++) {
        const q = cells[i];
        if (q.st >= STEPS) continue;
        const show = showOf(q, el);
        const k = show >= 1 ? STEPS : Math.floor(show * STEPS);
        if (k === q.st) continue;
        q.st = k;
        clearBox(q);
        if (k >= STEPS) { put(q, false, q.a); pending--; }
        else if (k > 0) put(q, true, Math.max(.55, q.a) * show);
      }
      ctx.globalAlpha = 1;
    };

    const draw = (now: number, sub: number) => {
      const el = (now - t0) / 1000;
      if (m.in || kicked > now) {
        full(el, sub);
        dirty = true;
        return;
      }
      if (dirty) {
        dirty = false;
        cells.forEach((q) => { q.x = q.hx; q.y = q.hy; q.vx = q.vy = 0; });
        full(el, 0);
        pending = cells.filter((q) => q.st < STEPS).length;
        return;
      }
      if (pending > 0) { intro(el); return; }
      if (now - lastFlip < 400) return;
      lastFlip = now;
      for (let i = 0; i < cells.length; i++) {
        if (Math.random() >= .01) continue;
        const q = cells[i];
        q.d = q.d === '0' ? '1' : '0';
        clearBox(q);
        put(q, false, q.a);
      }
      ctx.globalAlpha = 1;
    };

    if (reduce) {
      full(1e3, 0);
      return;
    }

    let stopTick: (() => void) | null = null;
    const stopIO = this.motion.observe(
      cv,
      (e) => {
        if (e.isIntersecting) { if (!stopTick) stopTick = this.motion.add(draw); }
        else if (stopTick) { stopTick(); stopTick = null; }
      },
      { rootMargin: '200px' },
    );

    const move = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      m.x = (e.clientX - r.left) * (FW / r.width); m.y = (e.clientY - r.top) * (FH / r.height); m.in = true;
    };
    const leave = () => { m.x = m.y = -999; m.in = false; kicked = performance.now() + 1500; };
    const burst = () => {
      kicked = performance.now() + 2500;
      cells.forEach((q) => { const a = Math.random() * Math.PI * 2, s = 10 + Math.random() * 30; q.vx += Math.cos(a) * s; q.vy += Math.sin(a) * s; });
    };
    cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerleave', leave);
    cv.addEventListener('click', burst);
    this.destroyRef.onDestroy(() => {
      stopIO(); stopTick?.();
      cv.removeEventListener('pointermove', move);
      cv.removeEventListener('pointerleave', leave);
      cv.removeEventListener('click', burst);
    });
  }
}

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
  st: number; th: number; r: number;
}

const FLY = .55;

@Component({
  selector: 'app-binary-portrait',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #cv role="img" [attr.aria-label]="label()"></canvas><canvas #fx class="fx" aria-hidden="true"></canvas>`,
  styles: `
    :host { display: block; position: relative; }
    canvas { width: 100%; aspect-ratio: 700 / 648; display: block; cursor: crosshair; touch-action: pan-y; }
    .fx { position: absolute; inset: 0; pointer-events: none; }
  `,
})
export class BinaryPortraitComponent {
  readonly label = input.required<string>();
  private cv = viewChild.required<ElementRef<HTMLCanvasElement>>('cv');
  private fx = viewChild.required<ElementRef<HTMLCanvasElement>>('fx');
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
    const calm = this.motion.reduced;
    // no celular o canvas aparece com ~350px: desenhar em 700px só gasta preenchimento
    const res = Math.min(1, (cv.clientWidth || FW) / FW) * dprCap();
    cv.width = Math.round(FW * res); cv.height = Math.round(FH * res);
    const ctx = cv.getContext('2d')!;
    ctx.setTransform(res, 0, 0, res, 0, 0);
    const GB = GL('#000000', GLYPH_FONT), GR = GL(RED, GLYPH_FONT_RED);

    const cells: Cell[] = [];
    const GC = Math.max(...FACE_GRID.map((row) => row.length)), GRW = FACE_GRID.length;
    const grid: (Cell | undefined)[] = new Array(GC * GRW);
    const cx = FW / 2, cy = FH * .35;
    FACE_GRID.forEach((row, r) => {
      for (let k = 0; k < row.length; k++) {
        const ch = row[k];
        if (ch === ' ') continue;
        const hx = k * CW + CW / 2, hy = r * CH + CH / 2;
        const th = Math.atan2(hy - cy, hx - cx), rr = Math.hypot(hx - cx, hy - cy);
        const q: Cell = {
          hx, hy, x: hx, y: hy, vx: 0, vy: 0, a: +ch / 9,
          d: Math.random() < .5 ? '0' : '1',
          delay: ((th + Math.PI) / (Math.PI * 2)) * .75 + rr / 900 + Math.random() * .12,
          st: 0, th, r: rr,
        };
        cells.push(q);
        grid[r * GC + k] = q;
      }
    });

    const m = { x: -999, y: -999, in: false };
    const R2 = 5200, R = Math.sqrt(R2);
    let kicked = 0, lastFlip = 0, dirty = false, pending = cells.length;
    let t0 = 0;
    const STEPS = 6; // a entrada de cada dígito é quantizada em 6 passos de opacidade

    const clearBox = (q: Cell) => ctx.clearRect(q.hx - CW / 2, q.hy - CH / 2, CW, CH);
    const put = (q: Cell, red: boolean, alpha: number) => {
      ctx.globalAlpha = alpha;
      ctx.drawImage((red ? GR : GB)[q.d], q.x - 8, q.y - 8, 16, 16);
    };
    const showOf = (q: Cell, el: number) => Math.min(1, Math.max(0, (el - q.delay) / .35));

    const full = (el: number, steps: number) => {
      ctx.clearRect(0, 0, FW, FH);
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

    let flying = !calm;
    // durante a montagem quem chegou é carimbado uma vez no canvas principal;
    // só os dígitos em voo são redesenhados, numa camada transparente por cima
    const fx = this.fx().nativeElement;
    const lite = cv.clientWidth > 0 && cv.clientWidth < 500;
    const flies = cells.map((q, i) => !lite || (q.a >= .45 && i % 3 === 0));
    let fctx: CanvasRenderingContext2D | null = null;
    if (flying) {
      const fres = lite ? res * .7 : res;
      fx.width = Math.round(FW * fres); fx.height = Math.round(FH * fres);
      fctx = fx.getContext('2d')!;
      fctx.setTransform(fres, 0, 0, fres, 0, 0);
    } else fx.remove();
    const fly = (el: number) => {
      const f = fctx!;
      f.clearRect(0, 0, FW, FH);
      let left = 0;
      for (let i = 0; i < cells.length; i++) {
        const q = cells[i];
        if (q.st === STEPS) continue;
        const p = (el - q.delay) / FLY;
        if (p >= 1) {
          q.st = STEPS;
          put(q, false, q.a);
          continue;
        }
        left++;
        if (p <= 0 || !flies[i]) continue;
        const e = 1 - (1 - p) * (1 - p) * (1 - p) * (1 - p);
        const ang = q.th + (1 - e) * 2.4, rad = q.r * (1 + (1 - e) * .7);
        f.globalAlpha = Math.min(1, p * 2.5) * Math.max(.55, q.a);
        f.drawImage(GR[q.d], cx + Math.cos(ang) * rad - 8, cy + Math.sin(ang) * rad - 8, 16, 16);
      }
      ctx.globalAlpha = 1;
      if (left) return;
      flying = false;
      fx.remove();
      fx.width = fx.height = 0;
      cells.forEach((q) => { q.vx = q.vy = 0; });
      pending = 0;
    };
    const flyEnd = Math.max(...cells.map((q) => q.delay)) + FLY;

    const awake = new Set<Cell>();
    const span = (a: number, b: number, size: number, max: number): [number, number] =>
      [Math.max(0, Math.floor(a / size)), Math.min(max - 1, Math.floor(b / size))];

    // o dedo só mexe numa área pequena: só esse retângulo é simulado e redesenhado
    const local = (sub: number) => {
      if (m.in) {
        const [c0, c1] = span(m.x - R, m.x + R, CW, GC), [r0, r1] = span(m.y - R, m.y + R, CH, GRW);
        for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) { const q = grid[r * GC + c]; if (q) awake.add(q); }
      }
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      const grow = (q: Cell) => {
        if (q.x < x0) x0 = q.x; if (q.x > x1) x1 = q.x;
        if (q.y < y0) y0 = q.y; if (q.y > y1) y1 = q.y;
      };
      for (const q of awake) {
        grow(q);
        for (let s = 0; s < sub; s++) {
          q.vx += (q.hx - q.x) * .09; q.vy += (q.hy - q.y) * .09;
          if (m.in) {
            const dx = q.x - m.x, dy = q.y - m.y, dd = dx * dx + dy * dy;
            if (dd < R2) { const f = (R2 - dd) / R2 * 2.4, r = Math.sqrt(dd) || 1; q.vx += dx / r * f; q.vy += dy / r * f; }
          }
          q.vx *= .78; q.vy *= .78; q.x += q.vx; q.y += q.vy;
        }
        if (sub && Math.random() < .01) q.d = q.d === '0' ? '1' : '0';
        if (Math.abs(q.vx) + Math.abs(q.vy) < .05 && Math.abs(q.x - q.hx) + Math.abs(q.y - q.hy) < .3) {
          q.x = q.hx; q.y = q.hy; q.vx = q.vy = 0;
          awake.delete(q);
        }
        grow(q);
      }
      if (x0 > x1) return;
      x0 -= 9; y0 -= 9; x1 += 9; y1 += 9;
      ctx.save();
      ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, y1 - y0); ctx.clip();
      ctx.clearRect(x0, y0, x1 - x0, y1 - y0);
      const [c0, c1] = span(x0 - 8, x1 + 8, CW, GC), [r0, r1] = span(y0 - 8, y1 + 8, CH, GRW);
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          const q = grid[r * GC + c];
          if (q && !awake.has(q)) put(q, false, q.a);
        }
      }
      for (const q of awake) {
        const moving = Math.abs(q.vx) + Math.abs(q.vy) > 1.2;
        put(q, moving, moving ? Math.max(.55, q.a) : q.a);
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    };

    let glideAt = 0;
    const finger = (now: number) => {
      const p = (now - glideAt) / 2000;
      if (p >= 1) { glideAt = 0; m.in = false; m.x = m.y = -999; return; }
      const e = p < .5 ? 2 * p * p : 1 - 2 * (1 - p) * (1 - p);
      m.x = FW * (1.2 * e - .1); m.y = FH * (.4 + Math.sin(p * 6.283) * .16); m.in = true;
    };

    const draw = (now: number, sub: number) => {
      if (glideAt && now >= glideAt) finger(now);
      if (!t0) t0 = now;
      const el = (now - t0) / 1000;
      if (flying) { fly(el); return; }
      if (kicked > now || (m.in && pending > 0)) {
        full(el, sub);
        dirty = true;
        return;
      }
      if (dirty) {
        dirty = false;
        awake.clear();
        cells.forEach((q) => { q.x = q.hx; q.y = q.hy; q.vx = q.vy = 0; });
        full(el, 0);
        pending = cells.filter((q) => q.st < STEPS).length;
        return;
      }
      if (pending > 0) { intro(el); return; }
      if (m.in || awake.size) { local(sub); return; }
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

    let stopTick: (() => void) | null = null, seen = false;
    const stopIO = this.motion.observe(
      cv,
      (e) => {
        if (e.isIntersecting) {
          if (!seen && this.motion.coarse && !calm) glideAt = performance.now() + flyEnd * 1000 + 400;
          seen = true;
          if (!stopTick) stopTick = this.motion.add(draw);
        }
        else if (stopTick) { stopTick(); stopTick = null; }
      },
      { rootMargin: '200px' },
    );

    const move = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      m.x = (e.clientX - r.left) * (FW / r.width); m.y = (e.clientY - r.top) * (FH / r.height); m.in = true;
    };
    const leave = () => { m.x = m.y = -999; m.in = false; };
    const burst = () => {
      if (calm) return;
      kicked = performance.now() + 2500;
      cells.forEach((q) => { const a = Math.random() * Math.PI * 2, s = 10 + Math.random() * 30; q.vx += Math.cos(a) * s; q.vy += Math.sin(a) * s; });
    };
    const nudge = () => {
      const d = this.motion.scrollDelta;
      if (!stopTick || Math.abs(d) < 3) return;
      const f = Math.max(-40, Math.min(40, d)) * .1;
      for (const q of cells) q.vy += f * (.5 + Math.random());
      kicked = Math.max(kicked, performance.now() + 1000);
    };
    const stopScroll = this.motion.coarse && !calm ? this.motion.onScroll(nudge) : () => {};
    cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerleave', leave);
    cv.addEventListener('click', burst);
    this.destroyRef.onDestroy(() => {
      stopIO(); stopScroll(); stopTick?.();
      cv.removeEventListener('pointermove', move);
      cv.removeEventListener('pointerleave', leave);
      cv.removeEventListener('click', burst);
    });
  }
}

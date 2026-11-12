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
import { GL, GLYPH_FONT, GLYPH_FONT_RED, RED, ShapeName, dprCap, fontsReady, sampleBin } from './shapes';

interface Cell {
  hx: number; hy: number; a: number;
  x: number; y: number; vx: number; vy: number;
  d: '0' | '1'; red: boolean;
}

@Component({
  selector: 'app-binary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #cv aria-hidden="true" [style.width.px]="w()" [style.aspect-ratio]="w() + ' / ' + h()"></canvas>`,
  styles: `
    :host { display: block; max-width: 100%; }
    canvas { display: block; max-width: 100%; cursor: crosshair; touch-action: pan-y; }
  `,
})
export class BinaryShapeComponent {
  readonly shape = input.required<ShapeName>();
  readonly w = input.required<number>();
  readonly h = input.required<number>();
  readonly ink = input('#000000');

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
    const W = this.w(), H = this.h(), dpr = dprCap(), reduce = this.motion.reduced;
    cv.width = W * dpr; cv.height = H * dpr;
    const ctx = cv.getContext('2d')!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const G = GL(this.ink(), GLYPH_FONT), GR = GL(RED, GLYPH_FONT_RED);
    const cells: Cell[] = sampleBin(this.shape(), W, H).map((c) => ({
      ...c,
      x: reduce ? c.hx : Math.random() * W,
      y: reduce ? c.hy : Math.random() * H,
      vx: 0, vy: 0,
      d: Math.random() < .5 ? '0' : '1',
      red: Math.random() < .08,
    }));

    const draw = (now: number, sub: number, active: boolean) => {
      ctx.clearRect(0, 0, W, H);
      const R2 = 2600;
      for (const q of cells) {
        if (active) {
          for (let s = 0; s < sub; s++) {
            q.vx += (q.hx - q.x) * .085; q.vy += (q.hy - q.y) * .085;
            if (m.in) {
              const dx = q.x - m.x, dy = q.y - m.y, dd = dx * dx + dy * dy;
              if (dd < R2) { const f = (R2 - dd) / R2 * 2.2, r = Math.sqrt(dd) || 1; q.vx += dx / r * f; q.vy += dy / r * f; }
            }
            q.vx *= .78; q.vy *= .78; q.x += q.vx; q.y += q.vy;
          }
        }
        if (active && Math.random() < .02) q.d = q.d === '0' ? '1' : '0';
        const mv = Math.abs(q.vx) + Math.abs(q.vy) > 1;
        ctx.globalAlpha = mv ? .95 : q.a;
        ctx.drawImage((mv || q.red ? GR : G)[q.d], q.x - 8, q.y - 8, 16, 16);
      }
      ctx.globalAlpha = 1;
    };

    const m = { x: -999, y: -999, in: false };
    if (reduce) {
      draw(0, 0, false);
      return;
    }

    let kick = 0, last = 0, started = false, dirty = true, stopTick: (() => void) | null = null;
    const tick = (now: number, sub: number) => {
      if (m.in || now < kick) {
        draw(now, sub, true);
        dirty = true;
        return;
      }
      if (dirty) {
        dirty = false;
        cells.forEach((q) => { q.x = q.hx; q.y = q.hy; q.vx = q.vy = 0; });
        draw(now, 0, false);
        last = now;
        return;
      }
      if (now - last < 700) return;
      last = now;
      for (const q of cells) {
        if (Math.random() >= .02) continue;
        q.d = q.d === '0' ? '1' : '0';
        ctx.clearRect(q.hx - 3.5, q.hy - 4.5, 7, 9);
        ctx.globalAlpha = q.a;
        ctx.drawImage((q.red ? GR : G)[q.d], q.x - 8, q.y - 8, 16, 16);
      }
      ctx.globalAlpha = 1;
    };
    const stopIO = this.motion.observe(
      cv,
      (e) => {
        if (e.isIntersecting) {
          if (!started) { started = true; kick = performance.now() + 2600; }
          if (!stopTick) stopTick = this.motion.add(tick);
        } else if (stopTick) {
          stopTick(); stopTick = null;
        }
      },
      { rootMargin: '100px' },
    );

    const move = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      m.x = (e.clientX - r.left) * W / r.width; m.y = (e.clientY - r.top) * H / r.height; m.in = true;
    };
    const leave = () => { m.in = false; kick = performance.now() + 1400; };
    const click = () => {
      kick = performance.now() + 2200;
      cells.forEach((c) => { const a = Math.random() * 6.283, sp = 6 + Math.random() * 16; c.vx += Math.cos(a) * sp; c.vy += Math.sin(a) * sp; });
    };
    cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerleave', leave);
    cv.addEventListener('click', click);
    this.destroyRef.onDestroy(() => {
      stopIO();
      stopTick?.();
      cv.removeEventListener('pointermove', move);
      cv.removeEventListener('pointerleave', leave);
      cv.removeEventListener('click', click);
    });
  }
}

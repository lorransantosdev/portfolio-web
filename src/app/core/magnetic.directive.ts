import { Directive, ElementRef, afterNextRender, inject, input, DestroyRef } from '@angular/core';
import { MotionService } from './motion.service';

interface Pull { el: HTMLElement; field: number; x: number; y: number; vx: number; vy: number; awake: boolean }

const STIFFNESS = 170;
const DAMPING = 16;
const MAX = 10;
const pulls = new Set<Pull>();
let pointer: { x: number; y: number } | null = null;
let bound = false;

const outside = (p: Pull, r: DOMRect) => {
  const cx = r.left - p.x + r.width / 2, cy = r.top - p.y + r.height / 2;
  const dx = pointer!.x - cx, dy = pointer!.y - cy;
  const out = Math.hypot(Math.max(0, Math.abs(dx) - r.width / 2), Math.max(0, Math.abs(dy) - r.height / 2));
  return { dx, dy, out };
};

@Directive({ selector: '[magnetic]' })
export class MagneticDirective {
  readonly magnetic = input<number | ''>('');

  private el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private motion = inject(MotionService);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (this.motion.reduced || this.motion.coarse) return;
      const field = typeof this.magnetic() === 'number' ? (this.magnetic() as number) : 36;
      const p: Pull = { el: this.el, field, x: 0, y: 0, vx: 0, vy: 0, awake: false };
      pulls.add(p);
      this.bind();
      destroyRef.onDestroy(() => {
        pulls.delete(p);
        p.el.style.translate = '';
      });
    });
  }

  private bind(): void {
    if (bound) return;
    bound = true;
    const wake = () => pulls.forEach((p) => this.wake(p));
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      pointer = { x: e.clientX, y: e.clientY };
      wake();
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { pointer = null; wake(); });
    window.addEventListener('blur', () => { pointer = null; wake(); });
  }

  private nearest(): Pull | null {
    if (!pointer) return null;
    let best: Pull | null = null, bestOut = Infinity;
    for (const p of pulls) {
      const r = p.el.getBoundingClientRect();
      if (r.bottom < -50 || r.top > window.innerHeight + 50) continue;
      const { out } = outside(p, r);
      if (out <= p.field && out < bestOut) { best = p; bestOut = out; }
    }
    return best;
  }

  private wake(p: Pull): void {
    if (p.awake) return;
    const near = pointer && this.nearest() === p;
    if (!near && !p.x && !p.y) return;
    p.awake = true;
    let last = performance.now();
    this.motion.add((now) => {
      const dt = Math.min(.032, (now - last) / 1000);
      last = now;
      let tx = 0, ty = 0;
      if (pointer && this.nearest() === p) {
        const r = p.el.getBoundingClientRect();
        const { dx, dy, out } = outside(p, r);
        const k = 1 - Math.min(1, out / p.field);
        const f = k * k * (3 - 2 * k);
        tx = Math.max(-MAX, Math.min(MAX, dx * .22 * f));
        ty = Math.max(-MAX, Math.min(MAX, dy * .3 * f));
      }
      p.vx += (STIFFNESS * (tx - p.x) - DAMPING * p.vx) * dt;
      p.vy += (STIFFNESS * (ty - p.y) - DAMPING * p.vy) * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const still = Math.abs(tx - p.x) < .05 && Math.abs(ty - p.y) < .05 && Math.abs(p.vx) < .05 && Math.abs(p.vy) < .05;
      if (still) {
        p.x = tx; p.y = ty; p.vx = p.vy = 0;
        p.el.style.translate = tx || ty ? tx.toFixed(2) + 'px ' + ty.toFixed(2) + 'px' : '';
        p.awake = false;
        return false;
      }
      p.el.style.translate = p.x.toFixed(2) + 'px ' + p.y.toFixed(2) + 'px';
      return true;
    });
  }
}

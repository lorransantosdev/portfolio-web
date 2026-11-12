import { Directive, ElementRef, afterNextRender, inject, input, DestroyRef } from '@angular/core';
import { MotionService } from './motion.service';

@Directive({ selector: '[tilt]' })
export class TiltDirective {
  readonly tilt = input(10);

  constructor() {
    const el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (motion.reduced || motion.coarse) return;
      const card = el.querySelector<HTMLElement>('.tilt-card');
      if (!card) return;
      const glare = document.createElement('div');
      glare.className = 'tilt-glare';
      card.appendChild(glare);
      let raf = 0;
      let last: PointerEvent | null = null;
      const apply = () => {
        raf = 0;
        if (!last) return;
        const r = el.getBoundingClientRect();
        const px = Math.min(1, Math.max(0, (last.clientX - r.left) / r.width));
        const py = Math.min(1, Math.max(0, (last.clientY - r.top) / r.height));
        const max = this.tilt();
        el.classList.add('is-hover');
        card.classList.add('is-tilting');
        card.style.setProperty('--tilt-ry', ((px - .5) * max).toFixed(2) + 'deg');
        card.style.setProperty('--tilt-rx', ((.5 - py) * max).toFixed(2) + 'deg');
        card.style.setProperty('--tilt-gx', (px * 100).toFixed(1) + '%');
        card.style.setProperty('--tilt-gy', (py * 100).toFixed(1) + '%');
      };
      const move = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        last = e;
        if (!raf) raf = requestAnimationFrame(apply);
      };
      const leave = () => {
        last = null;
        cancelAnimationFrame(raf);
        raf = 0;
        el.classList.remove('is-hover');
        card.classList.remove('is-tilting');
        card.style.setProperty('--tilt-rx', '0deg');
        card.style.setProperty('--tilt-ry', '0deg');
      };
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', leave);
      destroyRef.onDestroy(() => {
        cancelAnimationFrame(raf);
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerleave', leave);
        glare.remove();
      });
    });
  }
}

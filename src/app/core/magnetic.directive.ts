import { Directive, ElementRef, afterNextRender, inject, DestroyRef } from '@angular/core';
import { MotionService } from './motion.service';

@Directive({ selector: '[magnetic]' })
export class MagneticDirective {
  private el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private motion = inject(MotionService);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (this.motion.reduced || this.motion.coarse) return;
      const el = this.el;
      el.style.transition = 'translate .25s ease-out';
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        el.style.translate =
          ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + 'px ' +
          ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px';
      };
      const leave = () => (el.style.translate = '0 0');
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', leave);
      destroyRef.onDestroy(() => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerleave', leave);
      });
    });
  }
}

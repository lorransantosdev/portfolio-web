import { Directive, ElementRef, afterNextRender, inject, input, DestroyRef } from '@angular/core';
import { MotionService } from './motion.service';

@Directive({ selector: '[drift]', host: { '[style.--drift]': 'drift()' } })
export class DriftDirective {
  readonly drift = input.required<number>();

  constructor() {
    const el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (motion.timeline || motion.reduced) return;
      const off = motion.onScroll(() => {
        const vh = window.innerHeight || 800;
        const r = el.getBoundingClientRect();
        if (r.bottom < -300 || r.top > vh + 300) return;
        el.style.translate = '0 ' + ((r.top + r.height / 2 - vh / 2) * this.drift()).toFixed(1) + 'px';
      });
      destroyRef.onDestroy(off);
    });
  }
}

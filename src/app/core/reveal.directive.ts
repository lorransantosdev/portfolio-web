import { Directive, ElementRef, afterNextRender, inject, DestroyRef } from '@angular/core';
import { MotionService } from './motion.service';

const EASE = 'cubic-bezier(.2,.8,.2,1)';

@Directive({ selector: '[reveal]' })
export class RevealDirective {
  private el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private motion = inject(MotionService);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (this.motion.reduced) return;
      const el = this.el;
      const sibs = el.parentElement
        ? Array.from(el.parentElement.children).filter((x) => x.hasAttribute('reveal'))
        : [el];
      const delay = Math.min(Math.max(0, sibs.indexOf(el)), 4) * 60;
      let hidden = false;
      const stop = this.motion.observe(
        el,
        (e) => {
          if (e.isIntersecting) {
            stop();
            if (!hidden) return;
            el.style.transition = `opacity .6s ${EASE} ${delay}ms, translate .6s ${EASE} ${delay}ms`;
            el.style.opacity = '1';
            el.style.translate = '0 0';
            setTimeout(() => {
              el.style.removeProperty('transition');
              el.style.removeProperty('opacity');
              el.style.removeProperty('translate');
            }, 650 + delay);
          } else if (!hidden && e.boundingClientRect.top > window.innerHeight) {
            hidden = true;
            el.style.opacity = '0';
            el.style.translate = '0 16px';
          }
        },
        { rootMargin: '0px 0px 12% 0px' },
      );
      destroyRef.onDestroy(stop);
    });
  }
}

import { Directive, ElementRef, afterNextRender, inject, DestroyRef } from '@angular/core';
import { MotionService } from './motion.service';

@Directive({ selector: '[reveal]' })
export class RevealDirective {
  private el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private motion = inject(MotionService);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const el = this.el;
      const sibs = el.parentElement
        ? Array.from(el.parentElement.children).filter((x) => x.hasAttribute('reveal'))
        : [el];
      const i = Math.min(Math.max(0, sibs.indexOf(el)), 3);
      if (i) el.style.setProperty('--rv-i', String(i));
      if (this.motion.timeline || el.getBoundingClientRect().top < window.innerHeight) return;

      el.classList.add('rv-wait');
      let timer: ReturnType<typeof setTimeout> | undefined;
      const stop = this.motion.observe(
        el,
        (e) => {
          if (!e.isIntersecting) return;
          stop();
          el.classList.add('rv-in');
          timer = setTimeout(() => el.classList.remove('rv-wait', 'rv-in'), 1100 + i * 80);
        },
        { rootMargin: '0px 0px -8% 0px' },
      );
      destroyRef.onDestroy(() => { stop(); clearTimeout(timer); });
    });
  }
}

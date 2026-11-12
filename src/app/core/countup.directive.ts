import { Directive, ElementRef, afterNextRender, inject, input, DestroyRef } from '@angular/core';
import { MotionService } from './motion.service';

@Directive({
  selector: '[countUp]',
  host: { '[textContent]': 'format(countUp())', style: 'display: inline-block; font-variant-numeric: tabular-nums' },
})
export class CountUpDirective {
  readonly countUp = input.required<number>();
  readonly locale = input('pt-BR');

  private el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private motion = inject(MotionService);

  format(n: number): string {
    return n.toLocaleString(this.locale());
  }

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const el = this.el;
      const box = el.getBoundingClientRect();
      if (box.top <= window.innerHeight) return;
      el.style.minWidth = box.width + 'px';
      el.textContent = this.format(0);
      let stopTick = () => {};
      const stop = this.motion.observe(el, (e) => {
        if (!e.isIntersecting) return;
        stop();
        const to = this.countUp();
        const t0 = performance.now();
        stopTick = this.motion.add((now) => {
          const p = Math.min(1, (now - t0) / 1400);
          const k = 1 - Math.pow(1 - p, 3);
          el.textContent = this.format(Math.round(to * k));
          return p < 1;
        });
      });
      destroyRef.onDestroy(() => {
        stop();
        stopTick();
      });
    });
  }
}

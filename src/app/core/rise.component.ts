import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, inject, input,
} from '@angular/core';
import { MotionService } from './motion.service';

interface Word { t: string; em: boolean; br: boolean; i: number }

@Component({
  selector: '[rise]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'rise' },
  template: `
    @for (w of words(); track $index) {
      @if (w.br) { <br /> } @else if ($index) { {{ ' ' }} }
      <span class="wm"><span class="wi" [class.em]="w.em" [style.--wi]="w.i">{{ w.t }}</span></span>
    }
  `,
})
export class RiseComponent {
  readonly rise = input.required<string>();
  readonly em = input('');
  readonly br = input(false);

  readonly words = computed<Word[]>(() => {
    const a = this.rise().split(/\s+/).filter(Boolean);
    const b = this.em().split(/\s+/).filter(Boolean);
    return [
      ...a.map((t) => ({ t, em: false, br: false })),
      ...b.map((t, k) => ({ t, em: true, br: k === 0 && this.br() })),
    ].map((w, i) => ({ ...w, i: Math.min(i, 4) }));
  });

  constructor() {
    const el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (motion.timeline || el.getBoundingClientRect().top < window.innerHeight) return;
      el.classList.add('rise-wait');
      const stop = motion.observe(
        el,
        (e) => {
          if (!e.isIntersecting) return;
          stop();
          el.classList.add('rise-in');
        },
        { rootMargin: '0px 0px -10% 0px' },
      );
      destroyRef.onDestroy(stop);
    });
  }
}

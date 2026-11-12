import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, input, viewChild,
} from '@angular/core';
import { MotionService } from './motion.service';

const STEP = 32;

@Component({
  selector: '[decrypt]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="sr-only">{{ decrypt() }}</span><span aria-hidden="true"><span #a>{{ decrypt() }}</span><span #b></span></span>`,
})
export class DecryptComponent {
  readonly decrypt = input.required<string>();
  readonly replay = input(false);

  private a = viewChild.required<ElementRef<HTMLElement>>('a');
  private b = viewChild.required<ElementRef<HTMLElement>>('b');

  constructor() {
    const host = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (motion.reduced) return;
      const a = this.a().nativeElement.firstChild as Text | null;
      const b = this.b().nativeElement;
      if (!a) return;
      let timer: ReturnType<typeof setInterval> | undefined;
      let done = 0;
      const text = () => this.decrypt();
      const noise = (s: string) =>
        Array.from(s, (c) => (/\s|[·,.:\/↓↗→]/.test(c) ? c : Math.random() < .5 ? '0' : '1')).join('');
      const paint = () => {
        const s = text();
        a.nodeValue = s.slice(0, done);
        b.textContent = noise(s.slice(done));
      };
      const run = () => {
        clearInterval(timer);
        done = 0;
        paint();
        const per = Math.max(1, Math.ceil(text().length / 22));
        timer = setInterval(() => {
          done = Math.min(text().length, done + per);
          paint();
          if (done >= text().length) clearInterval(timer);
        }, STEP);
      };
      const above = host.getBoundingClientRect().top < window.innerHeight;
      if (!above) paint();
      const stop = motion.observe(
        host,
        (e) => {
          if (!e.isIntersecting) return;
          stop();
          run();
        },
        { rootMargin: '0px 0px -12% 0px' },
      );
      const again = () => done >= text().length && run();
      if (this.replay() && !motion.coarse) host.addEventListener('pointerenter', again);
      destroyRef.onDestroy(() => {
        stop();
        clearInterval(timer);
        host.removeEventListener('pointerenter', again);
      });
    });
  }
}

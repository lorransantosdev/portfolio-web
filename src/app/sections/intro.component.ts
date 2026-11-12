import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, viewChild,
} from '@angular/core';
import { I18n } from '../core/i18n';
import { MotionService } from '../core/motion.service';
import { ChapterDirective } from '../core/chapter';

@Component({
  selector: 'app-intro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChapterDirective],
  template: `
    <section id="historia" [chapter]="t().intro.chapter" [say]="t().intro.say" class="dark">
      <div class="wrap inner">
        <p #p class="big">
          @for (tok of t().intro.words; track $index) {
            {{ tok.tight || $index === 0 ? '' : ' ' }}
            @switch (tok.k) {
              @case ('avatar') {
                <img class="w avatar" src="assets/avatar.webp" width="240" height="240" [alt]="t().intro.avatarAlt" decoding="async" />
              }
              @case ('em') { <span class="w em">{{ tok.t }}</span> }
              @case ('pill') { <span class="w pill">{{ tok.t }}</span> }
              @default { <span class="w">{{ tok.t }}</span> }
            }
          }
        </p>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }
    .dark { background: var(--black); color: var(--cream); }
    .inner { padding-top: 110px; padding-bottom: 110px; }
    .big { margin: 0; font-size: clamp(32px, 4.2vw, 56px); line-height: 1.22; font-weight: 500; letter-spacing: -.025em; }
    .avatar {
      width: 1.15em; height: 1.15em; border-radius: 50%; object-fit: cover;
      vertical-align: -0.2em; border: 2px solid var(--cream);
    }
    .em { font-family: var(--font-display); font-style: italic; font-weight: 400; color: var(--red); }
    .pill { border: 1px solid rgba(249, 242, 234, .4); border-radius: var(--radius-pill); padding: 0 .35em; }
    @media (max-width: 760px) { .inner { padding-top: 64px; padding-bottom: 64px; } }
  `,
})
export class IntroComponent {
  readonly t = inject(I18n).t;
  private p = viewChild.required<ElementRef<HTMLElement>>('p');

  constructor() {
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (motion.reduced) return;
      const p = this.p().nativeElement;
      const words = Array.from(p.querySelectorAll<HTMLElement>('.w'));
      const state: string[] = [];
      let off = () => {};
      const stopIO = motion.observe(
        p,
        (e) => {
          if (!e.isIntersecting) return;
          stopIO();
          let first = true;
          off = motion.onScroll(() => {
            const vh = window.innerHeight || 800;
            const r = p.getBoundingClientRect();
            const prog = Math.min(1, Math.max(0, (vh * .85 - r.top) / (r.height + vh * .35)));
            const lit = Math.round(prog * words.length);
            words.forEach((w, i) => {
              const o = i < lit ? '1' : '.18';
              if (state[i] !== o) { state[i] = o; w.style.opacity = o; }
            });
            if (first) {
              first = false;
              requestAnimationFrame(() => words.forEach((w) => (w.style.transition = 'opacity .35s')));
            }
          });
        },
      );
      destroyRef.onDestroy(() => { stopIO(); off(); });
    });
  }
}

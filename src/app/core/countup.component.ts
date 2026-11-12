import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, inject, input,
} from '@angular/core';
import { MotionService } from './motion.service';

interface Cell { ch: string; to: number; i: number }

const STRIP = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

@Component({
  selector: '[countUp]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="sr-only">{{ text() }}</span>
    <span class="reel" aria-hidden="true">
      @for (c of cells(); track $index) {
        @if (c.to < 0) {
          <span class="sep">{{ c.ch }}</span>
        } @else {
          <span class="col" [style.--to]="c.to" [style.--i]="c.i">
            <span class="sz">{{ c.ch }}</span>
            <span class="strip">@for (k of strip; track $index) {<span>{{ k }}</span>}</span>
          </span>
        }
      }
    </span>
  `,
  styles: `
    :host { display: inline-block; font-variant-numeric: tabular-nums; }
    .reel { display: inline-flex; }
    .col {
      position: relative; display: inline-block; padding-block: .3em; margin-block: -.3em;
      clip-path: inset(calc(50% - .6em) -.1em); transform-origin: 50% 60%;
    }
    .sz { visibility: hidden; }
    .strip {
      position: absolute; left: 0; right: 0; top: calc(50% - .6em); display: flex; flex-direction: column;
      align-items: center; line-height: 1.2em; translate: 0 calc(var(--to) * -1.2em);
    }
    .strip > span { height: 1.2em; }
    :host(.wait) .strip { translate: 0 0; }
    :host(.roll) .strip {
      transition: translate calc(var(--to) * var(--reel-step-dur)) var(--reel-ease) calc(var(--i) * var(--reel-stagger));
      animation: reel-blur calc(var(--to) * var(--reel-step-dur)) var(--ease-linear) calc(var(--i) * var(--reel-stagger)) both;
    }
    :host(.roll) .col {
      animation: reel-land var(--reel-land-dur) var(--ease-bounce)
        calc(var(--to) * var(--reel-step-dur) + var(--i) * var(--reel-stagger) - 60ms) both;
    }
    @keyframes reel-blur { 0%, 100% { filter: blur(0); } 15%, 75% { filter: blur(var(--blur-small)); } }
    @keyframes reel-land { 0% { scale: 1; } 14% { scale: .94; } 45% { scale: 1.03; } 100% { scale: 1; } }
  `,
})
export class CountUpComponent {
  readonly countUp = input.required<number>();
  readonly locale = input('pt-BR');
  readonly strip = STRIP;

  readonly text = computed(() => this.countUp().toLocaleString(this.locale()));
  readonly cells = computed<Cell[]>(() => {
    let i = 0;
    return Array.from(this.text(), (ch) => {
      if (ch < '0' || ch > '9') return { ch, to: -1, i: 0 };
      const d = +ch;
      return { ch, to: d >= 3 ? d : d + 10, i: i++ };
    });
  });

  constructor() {
    const el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (motion.reduced || el.getBoundingClientRect().top <= window.innerHeight) return;
      el.classList.add('wait');
      const stop = motion.observe(
        el,
        (e) => {
          if (!e.isIntersecting) return;
          stop();
          void el.offsetWidth;
          el.classList.add('roll');
          el.classList.remove('wait');
        },
        { rootMargin: '0px 0px -10% 0px' },
      );
      destroyRef.onDestroy(stop);
    });
  }
}

import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, inject, signal, viewChild,
} from '@angular/core';
import { I18n } from '../core/i18n';
import { MotionService } from '../core/motion.service';
import { ChapterService } from '../core/chapter';

@Component({
  selector: 'app-mini-scott',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="mini press" [class.on]="on()" [href]="href()" [attr.aria-label]="t().mini.aria"
       [attr.aria-hidden]="on() ? null : 'true'" [attr.tabindex]="on() ? null : -1">
      @if (say() && on()) { <span class="say" role="status">{{ say() }}</span> }
      <img #img src="assets/scott-wave-mini.webp" width="160" height="143" alt="" decoding="async" loading="lazy" />
    </a>
  `,
  styles: `
    .mini {
      position: fixed; right: 22px; bottom: 18px; z-index: 30; display: flex; align-items: flex-end; gap: 8px;
      text-decoration: none; opacity: 0; pointer-events: none; transition: opacity .4s, scale .18s var(--ease);
      transform-origin: 100% 100%; -webkit-tap-highlight-color: transparent;
    }
    .mini.on { opacity: 1; pointer-events: auto; }
    .say {
      background: var(--black); color: var(--cream); font-size: 13px; line-height: 1.35; padding: 9px 12px;
      border-radius: 14px 14px 4px 14px; max-width: 210px; margin-bottom: 40px;
    }
    img { width: 78px; height: auto; filter: drop-shadow(0 10px 14px rgba(0, 0, 0, .25)); }
    @media (max-width: 760px) {
      .mini { right: 10px; bottom: 10px; }
      img { width: 50px; }
      .say { margin-bottom: 26px; font-size: 12px; max-width: 170px; }
    }
  `,
})
export class MiniScottComponent {
  readonly t = inject(I18n).t;
  readonly say = inject(ChapterService).miniSay;
  readonly on = signal(false);
  readonly href = computed(() => (this.t().path === '/' ? '/' : this.t().path) + '#scott');
  private img = viewChild.required<ElementRef<HTMLElement>>('img');

  constructor() {
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const img = this.img().nativeElement;
      let stopTick: (() => void) | null = null;
      const off = motion.onScroll(() => {
        const y = window.scrollY || 0, vh = window.innerHeight || 800;
        const sc = document.getElementById('scott');
        const r = sc ? sc.getBoundingClientRect() : null;
        const inScott = !!r && r.top < vh * .7 && r.bottom > vh * .3;
        const on = y > vh * .8 && !inScott;
        if (on !== this.on()) {
          this.on.set(on);
          if (motion.reduced) return;
          if (on && !stopTick) {
            stopTick = motion.add((now) => {
              img.style.translate = '0 ' + (Math.sin((now / 1000) * 2.2) * 4).toFixed(1) + 'px';
            });
          } else if (!on && stopTick) { stopTick(); stopTick = null; }
        }
      });
      destroyRef.onDestroy(() => { off(); stopTick?.(); });
    });
  }
}

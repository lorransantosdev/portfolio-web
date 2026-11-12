import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, inject, viewChild,
} from '@angular/core';
import { I18n } from '../core/i18n';
import { ChapterService } from '../core/chapter';
import { MotionService } from '../core/motion.service';

@Component({
  selector: 'app-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="nav" [attr.aria-label]="t().lang === 'pt' ? 'Principal' : 'Main'">
      <div class="navin">
        <a #logo class="logo" [href]="base() + '#topo'" [attr.aria-label]="t().nav.homeAria">
          <img class="mark" src="logo.svg" width="28" height="28" alt="" />
          <span class="word">lorran<span class="deg" aria-hidden="true">°</span></span>
          <span class="ch" aria-live="off">{{ chapter() ? '/ ' + chapter() : '' }}</span>
        </a>
        <div class="navl">
          @for (l of t().nav.links; track l.href) {
            <a class="ul" [href]="base() + '#' + l.href">{{ l.label }}</a>
          }
        </div>
        <div class="actions">
          <a class="lang tap" [href]="t().nav.switchHref" [attr.title]="t().nav.switchTitle"
             [attr.hreflang]="t().lang === 'pt' ? 'en' : 'pt-BR'" [attr.lang]="t().lang === 'pt' ? 'en' : 'pt-BR'">{{ t().nav.switchLabel }}</a>
          <a class="cv tap" [href]="t().nav.resumeHref" target="_blank" rel="noopener">{{ t().nav.resume }}</a>
        </div>
      </div>
      <div #prog class="prog" aria-hidden="true"></div>
    </nav>
  `,
  styles: `
    :host { display: contents; }
    .nav {
      position: sticky; top: 0; z-index: 20;
      background: rgba(249, 242, 234, .88);
      -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(0, 0, 0, .08);
    }
    .navin {
      max-width: var(--container); margin: 0 auto; padding: 0 var(--pad-x); height: 64px;
      display: flex; align-items: center; justify-content: space-between; gap: 16px;
    }
    .logo {
      text-decoration: none; font-weight: 600; font-size: 17px; letter-spacing: -.02em;
      display: inline-flex; align-items: center; gap: 10px; white-space: nowrap;
    }
    .mark {
      width: 28px; height: 28px; flex: 0 0 auto; margin-right: -4px;
      animation: mark-in .9s var(--ease) .1s both;
    }
    @keyframes mark-in { from { opacity: 0; rotate: -200deg; scale: .4; } to { opacity: 1; rotate: 0deg; scale: 1; } }
    @media (prefers-reduced-motion: reduce) {
      @keyframes mark-in { from { opacity: 0; scale: .9; } }
    }
    .deg { color: var(--red); }
    .ch { font-weight: 400; font-size: 14px; color: var(--muted); }
    .navl { display: flex; gap: 22px; font-size: 14px; flex-wrap: wrap; }
    .navl a { text-decoration: none; }
    .actions { display: flex; align-items: center; gap: 8px; }
    .lang {
      text-decoration: none; font-family: var(--font-mono); font-size: 12px; font-weight: 500;
      padding: 10px 12px; border-radius: var(--radius-pill); border: 1px solid rgba(0, 0, 0, .2);
    }
    .cv {
      text-decoration: none; font-size: 14px; font-weight: 500; padding: 10px 16px;
      border-radius: var(--radius-pill); background: var(--black); color: var(--cream); white-space: nowrap;
    }
    .cv:hover { color: var(--cream); background: #1a1a1a; }
    .prog {
      position: absolute; left: 0; bottom: -1px; height: 2px; width: 100%;
      transform-origin: 0 50%; transform: scaleX(0); background: var(--red);
    }
    @keyframes prog { to { transform: scaleX(1); } }
    @supports (animation-timeline: scroll()) {
      .prog { animation: prog linear both; animation-timeline: scroll(root); }
    }
    @media (max-width: 760px) {
      .navl { display: none; }
      .ch { display: none; }
    }
    @media (min-width: 761px) and (max-width: 1024px) {
      .navl { gap: 14px; }
      .ch { display: none; }
    }
  `,
})
export class NavComponent {
  readonly t = inject(I18n).t;
  readonly chapter = inject(ChapterService).chapter;
  readonly base = computed(() => (this.t().path === '/' ? '/' : this.t().path));
  private prog = viewChild.required<ElementRef<HTMLElement>>('prog');
  private logo = viewChild.required<ElementRef<HTMLElement>>('logo');

  constructor() {
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const el = this.prog().nativeElement;
      const off = motion.timeline ? () => {} : motion.onScroll(() => {
        const y = window.scrollY || 0, vh = window.innerHeight || 800;
        const dh = document.documentElement.scrollHeight - vh;
        el.style.transform = 'scaleX(' + (dh > 0 ? Math.min(1, y / dh) : 0).toFixed(4) + ')';
      });
      destroyRef.onDestroy(off);
      if (motion.reduced || motion.coarse) return;
      const logo = this.logo().nativeElement;
      const mark = logo.querySelector<HTMLElement>('.mark')!;
      let spin: Animation | null = null;
      const enter = () => {
        if (spin?.playState === 'running') return;
        spin = mark.animate([{ rotate: '0deg' }, { rotate: '360deg' }], {
          duration: 2400, easing: 'cubic-bezier(.45, 0, .25, 1)',
        });
      };
      logo.addEventListener('pointerenter', enter);
      destroyRef.onDestroy(() => logo.removeEventListener('pointerenter', enter));
    });
  }
}

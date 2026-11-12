import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, viewChild,
} from '@angular/core';
import { I18n } from '../core/i18n';
import { MotionService } from '../core/motion.service';
import { MagneticDirective } from '../core/magnetic.directive';
import { RevealDirective } from '../core/reveal.directive';
import { DecryptComponent } from '../core/decrypt.component';
import { BinaryPortraitComponent } from '../binary/binary-portrait.component';

@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MagneticDirective, RevealDirective, DecryptComponent, BinaryPortraitComponent],
  template: `
    <header id="topo" class="top">
      <div class="hero">
        <div class="left">
          <div class="kicker mono ld"><span class="dot" aria-hidden="true"></span><span [decrypt]="t().hero.kicker" [replay]="true"></span></div>
          <h1>{{ t().hero.titlePre }}<em class="shimmer" [attr.data-text]="t().hero.titleEm">{{ t().hero.titleEm }}</em>{{ t().hero.titlePost }}</h1>
          <p class="lead ld" style="--d: 2">{{ t().hero.lead }}</p>
          <div class="ctas ld" style="--d: 3">
            <a magnetic class="btn btn-dark" [href]="base() + '#historia'">{{ t().hero.ctaStory }}</a>
            <a magnetic class="btn btn-line" [href]="base() + '#scott'">{{ t().hero.ctaScott }}</a>
          </div>
        </div>
        <div class="portrait">
          <app-binary-portrait [label]="t().hero.portraitAria" />
        </div>
        <div class="facts">
          @for (f of t().hero.facts; track f.k; let last = $last) {
            <div reveal class="fact" [class.last]="last">
              <div class="k mono">{{ f.k }}</div>
              <div class="v">{{ f.v }}</div>
            </div>
          }
          <div class="hint mono"><span class="h-ptr">{{ t().hero.hint }}</span><span class="h-touch">{{ t().hero.hintTouch }}</span></div>
        </div>
      </div>
      <div #name class="bigname" aria-hidden="true">
        @for (l of letters; track $index) {
          <span class="nl" [style.--i]="$index">{{ l }}</span>
        }
      </div>
    </header>
  `,
  styles: `
    :host { display: block; }
    .top { position: relative; overflow: clip; border-bottom: 1px solid rgba(0, 0, 0, .1); }
    .hero {
      max-width: var(--container); margin: 0 auto; padding: 56px var(--pad-x) 0;
      display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); column-gap: var(--gutter); align-items: end;
    }
    .left { grid-column: span 4; }
    .portrait { grid-column: span 5; }
    .facts { grid-column: span 3; }
    .left { padding-bottom: 90px; position: relative; z-index: 3; }
    .kicker { font-size: 12px; display: flex; align-items: center; gap: 10px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--red); display: inline-block; }
    h1 {
      margin: 20px 0 0; font-family: var(--font-display); font-weight: 400;
      font-size: clamp(36px, 3.6vw, 54px); line-height: 1; letter-spacing: -.02em;
    }
    h1 em { font-style: italic; color: var(--red); --shimmer-highlight: #ffb39f; --shimmer-runs: 2; --shimmer-delay: 900ms; }
    .lead { margin: 18px 0 0; font-size: 16px; line-height: 1.55; color: var(--body-2); max-width: 320px; }
    .ctas { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
    .portrait { position: relative; z-index: 2; }
    .facts { padding-bottom: 90px; position: relative; z-index: 3; display: flex; flex-direction: column; font-size: 15px; }
    .fact { padding: 14px 0; border-top: 1px solid var(--line); }
    .fact.last { border-bottom: 1px solid var(--line); }
    .k { font-size: 11px; color: var(--muted); }
    .v { font-weight: 600; margin-top: 2px; }
    .hint { font-size: 11px; color: var(--muted); margin-top: 14px; }
    .h-touch { display: none; }
    @media (hover: none) {
      .h-ptr { display: none; }
      .h-touch { display: inline; }
    }
    .bigname {
      position: relative; z-index: 1; margin-top: -0.42em; text-align: center;
      font-family: var(--font-display); font-size: clamp(140px, 19vw, 300px); line-height: .78;
      padding-bottom: 0.08em; letter-spacing: -.045em; color: var(--red); white-space: nowrap;
      user-select: none; will-change: translate;
    }
    .nl { display: inline-block; animation: rise var(--duration-entrance) var(--ease-smooth-out) both; animation-delay: calc(300ms + var(--i) * var(--duration-micro)); }
    @keyframes rise { from { opacity: 0; translate: 0 40%; } to { opacity: 1; translate: 0 0; } }
    .ld { animation: ld var(--stagger-dur) var(--ease-smooth-out) both; animation-delay: calc(var(--d, 0) * var(--duration-micro) + var(--duration-micro)); }
    @keyframes ld { from { opacity: 0; translate: 0 var(--stagger-distance); filter: blur(var(--stagger-blur)); } }
    @keyframes name-drift { to { translate: 0 27vh; } }
    @supports (animation-timeline: scroll()) {
      .bigname { animation: name-drift linear both; animation-timeline: scroll(root); animation-range: 0 150vh; }
    }
    @media (prefers-reduced-motion: reduce) {
      @keyframes rise { from { opacity: 0; } }
      @keyframes ld { from { opacity: 0; } }
      .bigname { animation: none; }
    }

    @media (min-width: 761px) and (max-width: 1024px) {
      .hero { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 32px var(--gutter); align-items: start; }
      .left, .facts { grid-column: auto; }
      .portrait { grid-column: 1 / -1; order: -1; width: 100%; max-width: 560px; justify-self: center; }
      .left, .facts { padding-bottom: 90px; }
    }
    @media (max-width: 760px) {
      .hero { grid-template-columns: minmax(0, 1fr); padding: 28px 20px 0; gap: 8px; }
      .left, .portrait, .facts { grid-column: auto; }
      .left, .facts { padding-bottom: 0; }
      .facts { padding-bottom: 24px; }
      .bigname { font-size: 31vw; margin-top: -.14em; }
    }
  `,
})
export class HeroComponent {
  readonly t = inject(I18n).t;
  readonly letters = ['L', 'o', 'r', 'r', 'a', 'n'];
  base = () => (this.t().path === '/' ? '/' : this.t().path);
  private name = viewChild.required<ElementRef<HTMLElement>>('name');

  constructor() {
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (motion.reduced || motion.timeline) return;
      const el = this.name().nativeElement;
      const off = motion.onScroll(() => {
        const y = window.scrollY || 0;
        if (y > window.innerHeight * 1.5) return;
        el.style.translate = '0 ' + (y * .18).toFixed(1) + 'px';
      });
      destroyRef.onDestroy(off);
    });
  }
}

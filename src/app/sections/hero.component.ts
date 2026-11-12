import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, viewChild,
} from '@angular/core';
import { I18n } from '../core/i18n';
import { MotionService } from '../core/motion.service';
import { MagneticDirective } from '../core/magnetic.directive';
import { RevealDirective } from '../core/reveal.directive';
import { BinaryPortraitComponent } from '../binary/binary-portrait.component';

@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MagneticDirective, RevealDirective, BinaryPortraitComponent],
  template: `
    <header id="topo" class="top">
      <div class="hero">
        <div class="left">
          <div class="kicker mono"><span class="dot" aria-hidden="true"></span>{{ t().hero.kicker }}</div>
          <h1>{{ t().hero.titlePre }}<em>{{ t().hero.titleEm }}</em>{{ t().hero.titlePost }}</h1>
          <p class="lead">{{ t().hero.lead }}</p>
          <div class="ctas">
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
          <div class="hint mono">{{ t().hero.hint }}</div>
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
    .top { position: relative; overflow: hidden; border-bottom: 1px solid rgba(0, 0, 0, .1); }
    .hero {
      max-width: var(--container-hero); margin: 0 auto; padding: 56px var(--pad-x) 0;
      display: grid; grid-template-columns: minmax(260px, 1fr) minmax(0, 520px) minmax(220px, 1fr);
      gap: 32px; align-items: end;
    }
    .left { padding-bottom: 90px; position: relative; z-index: 3; }
    .kicker { font-size: 12px; display: flex; align-items: center; gap: 10px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--red); display: inline-block; }
    h1 {
      margin: 20px 0 0; font-family: var(--font-display); font-weight: 400;
      font-size: clamp(36px, 3.6vw, 54px); line-height: 1; letter-spacing: -.02em;
    }
    h1 em { font-style: italic; color: var(--red); }
    .lead { margin: 18px 0 0; font-size: 16px; line-height: 1.55; color: var(--body-2); max-width: 320px; }
    .ctas { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
    .portrait { position: relative; z-index: 2; }
    .facts { padding-bottom: 90px; position: relative; z-index: 3; display: flex; flex-direction: column; font-size: 15px; }
    .fact { padding: 14px 0; border-top: 1px solid var(--line); }
    .fact.last { border-bottom: 1px solid var(--line); }
    .k { font-size: 11px; color: var(--muted); }
    .v { font-weight: 600; margin-top: 2px; }
    .hint { font-size: 11px; color: var(--muted); margin-top: 14px; }
    .bigname {
      position: relative; z-index: 1; margin-top: -0.42em; text-align: center;
      font-family: var(--font-display); font-size: clamp(140px, 19vw, 300px); line-height: .78;
      padding-bottom: 0.08em; letter-spacing: -.045em; color: var(--red); white-space: nowrap;
      user-select: none; will-change: translate;
    }
    .nl { display: inline-block; animation: rise .9s var(--ease) both; animation-delay: calc(300ms + var(--i) * 70ms); }
    @keyframes rise { from { opacity: 0; translate: 0 40%; } to { opacity: 1; translate: 0 0; } }
    @media (prefers-reduced-motion: reduce) { .nl { animation: none; } }

    @media (min-width: 761px) and (max-width: 1024px) {
      .hero { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
      .portrait { grid-column: 1 / -1; order: -1; width: 100%; max-width: 560px; justify-self: center; }
      .left, .facts { padding-bottom: 90px; }
    }
    @media (max-width: 760px) {
      .hero { grid-template-columns: minmax(0, 1fr); padding: 28px 20px 0; gap: 8px; }
      .left, .facts { padding-bottom: 0; }
      .facts { padding-bottom: 24px; }
      .bigname { font-size: 31vw; }
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
      if (motion.reduced) return;
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

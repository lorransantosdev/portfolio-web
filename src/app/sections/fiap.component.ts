import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, viewChildren,
} from '@angular/core';
import { I18n } from '../core/i18n';
import { MotionService } from '../core/motion.service';
import { RevealDirective } from '../core/reveal.directive';
import { CountUpDirective } from '../core/countup.directive';
import { ChapterDirective } from '../core/chapter';
import { BinaryShapeComponent } from '../binary/binary-shape.component';

@Component({
  selector: 'app-fiap',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, CountUpDirective, ChapterDirective, BinaryShapeComponent],
  template: `
    <section [chapter]="t().fiap.chapter" class="sec" aria-label="FIAP">
      <div class="autogrid grid">
        <div>
          <div class="score">
            <div class="num"><span [countUp]="940" [locale]="t().locale"></span></div>
            <app-binary shape="trofeu" [w]="150" [h]="170" ink="#000000" />
          </div>
          <div class="label">{{ t().fiap.counterLabel }}</div>
          <p class="text">{{ t().fiap.text }}</p>
          <div class="rows">
            @for (r of t().fiap.rows; track $index; let last = $last) {
              <div reveal class="r" [class.last]="last">
                @if (r.href) {
                  <a class="ul" [href]="r.href">{{ r.label }} <span class="post">{{ t().fiap.postLabel }}</span></a>
                } @else {
                  <span>{{ r.label }}</span>
                }
                <span class="res">{{ r.result }}</span>
              </div>
            }
          </div>
        </div>
        <div class="photos">
          @for (ph of t().fiap.photos; track ph.src; let i = $index) {
            <figure #ph reveal class="lift pol" [class.p2]="i === 1">
              <img [src]="ph.src" [alt]="ph.alt" loading="lazy" decoding="async" width="506" height="675" />
              <figcaption class="mono">{{ ph.caption }}</figcaption>
            </figure>
          }
        </div>
      </div>
      <p reveal class="next">{{ t().fiap.next }} <span class="bob" aria-hidden="true">↓</span></p>
    </section>
  `,
  styles: `
    :host { display: block; }
    .sec { max-width: var(--container); margin: 0 auto; padding: 80px var(--pad-x) 40px; }
    .grid { --min: 300px; margin-top: 28px; align-items: center; }
    .score { display: flex; align-items: flex-end; gap: 24px; flex-wrap: wrap; }
    .num { font-family: var(--font-display); font-size: clamp(110px, 14vw, 200px); line-height: .8; letter-spacing: -.04em; }
    .label { font-size: 18px; margin-top: 14px; }
    .text { font-size: 17px; line-height: 1.6; color: var(--body); margin: 26px 0 0; max-width: 460px; }
    .rows { display: flex; flex-direction: column; margin-top: 24px; max-width: 460px; }
    .r { display: flex; justify-content: space-between; gap: 12px; padding: 12px 0; border-top: 1px solid var(--line); }
    .r.last { border-bottom: 1px solid var(--line); }
    .post { font-size: 12px; opacity: .55; }
    .res { color: var(--red); font-weight: 600; white-space: nowrap; }
    .photos { position: relative; height: 560px; }
    .pol {
      position: absolute; left: 0; top: 30px; width: 58%; margin: 0; background: var(--white);
      padding: 10px 10px 14px; box-shadow: 0 30px 60px -30px rgba(0, 0, 0, .45); transform: rotate(-4deg);
    }
    .pol.p2 { left: auto; right: 0; top: 0; width: 56%; transform: rotate(5deg); }
    .pol img { width: 100%; height: auto; aspect-ratio: 3 / 4; object-fit: cover; display: block; }
    figcaption { font-size: 11px; margin-top: 10px; }
    @media (max-width: 760px) {
      .sec { padding: 56px 20px 24px; }
      .photos { height: 430px; }
    }
  `,
})
export class FiapComponent {
  readonly t = inject(I18n).t;
  private phs = viewChildren<ElementRef<HTMLElement>>('ph');

  constructor() {
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (motion.reduced) return;
      const els = this.phs().map((r) => r.nativeElement);
      const off = motion.onScroll(() => {
        const vh = window.innerHeight || 800;
        els.forEach((el, k) => {
          const r = el.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          const o = (r.top + r.height / 2 - vh / 2) * (k ? -.06 : .05);
          el.style.translate = '0 ' + o.toFixed(1) + 'px';
        });
      });
      destroyRef.onDestroy(off);
    });
  }
}

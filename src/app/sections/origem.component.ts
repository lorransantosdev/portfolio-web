import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18n } from '../core/i18n';
import { RevealDirective } from '../core/reveal.directive';
import { ChapterDirective } from '../core/chapter';
import { BinaryShapeComponent } from '../binary/binary-shape.component';

@Component({
  selector: 'app-origem',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, ChapterDirective, BinaryShapeComponent],
  template: `
    <section [chapter]="t().origem.chapter" class="sec" aria-labelledby="origem-t">
      <div class="autogrid grid">
        <div>
          <h2 id="origem-t" reveal class="title">{{ t().origem.title }}</h2>
          <div reveal class="bins">
            <app-binary shape="queijo" [w]="220" [h]="150" ink="#000000" />
            <app-binary shape="anel" [w]="170" [h]="150" ink="#000000" />
          </div>
        </div>
        <div class="items">
          <div reveal class="item">
            <div class="it">{{ t().origem.cheeseTitle }}</div>
            <div class="tx">{{ t().origem.cheeseText }}</div>
          </div>
          <div reveal class="item last">
            <div class="row"><span class="it">{{ t().origem.shopTitle }}</span><span class="stat">{{ t().origem.shopStat }}</span></div>
            <div class="tx">{{ t().origem.shopText }}</div>
          </div>
        </div>
      </div>
      <p reveal class="next">{{ t().origem.next }} <span class="bob" aria-hidden="true">↓</span></p>
    </section>
  `,
  styles: `
    :host { display: block; }
    .sec { max-width: var(--container); margin: 0 auto; padding: 120px var(--pad-x) 40px; }
    .grid { --min: 280px; margin-top: 28px; align-items: start; }
    .title { margin: 0; font-family: var(--font-display); font-weight: 400; font-size: clamp(44px, 5vw, 72px); line-height: .95; letter-spacing: -.02em; }
    .bins { display: flex; gap: 28px; margin-top: 36px; flex-wrap: wrap; }
    .items { display: flex; flex-direction: column; }
    .item { padding: 22px 0; border-top: 1px solid var(--line); }
    .item.last { border-bottom: 1px solid var(--line); }
    .it { font-size: 20px; font-weight: 600; letter-spacing: -.01em; }
    .row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
    .stat { font-size: 34px; font-weight: 600; color: var(--red); letter-spacing: -.03em; }
    .tx { font-size: 16px; line-height: 1.55; color: var(--body); margin-top: 6px; }
    @media (max-width: 760px) { .sec { padding: 56px 20px 24px; } }
  `,
})
export class OrigemComponent {
  readonly t = inject(I18n).t;
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18n } from '../core/i18n';
import { RevealDirective } from '../core/reveal.directive';
import { RiseComponent } from '../core/rise.component';
import { ChapterDirective } from '../core/chapter';
import { BinaryShapeComponent } from '../binary/binary-shape.component';

@Component({
  selector: 'app-publico',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, RiseComponent, ChapterDirective, BinaryShapeComponent],
  template: `
    <section id="publico" [chapter]="t().publico.chapter" [say]="t().publico.say" class="sec" aria-labelledby="pub-t">
      <div class="autogrid grid">
        <div>
          <div reveal class="at"><app-binary shape="arroba" [w]="170" [h]="170" ink="#000000" /></div>
          <h2 id="pub-t" class="title" rise="@lorrandev"></h2>
          <p class="text">{{ t().publico.text }}</p>
          <div class="chips">
            @for (c of t().publico.chips; track c.href) {
              <a class="chip tap" [href]="c.href">{{ c.label }}</a>
            }
          </div>
        </div>
        <div>
          <h3 class="label mono">{{ t().publico.postsLabel }}</h3>
          @for (p of t().publico.posts; track $index; let last = $last) {
            <a reveal class="crow row" [class.last]="last" [href]="p.href">
              <span><span class="pt">{{ p.title }}</span><span class="ps">{{ p.sub }}</span></span>
              <span class="carr" aria-hidden="true">↗</span>
            </a>
          }
        </div>
      </div>
      <p reveal class="next">{{ t().publico.next }} <span class="bob" aria-hidden="true">↓</span></p>
    </section>
  `,
  styles: `
    :host { display: block; }
    .sec { max-width: var(--container); margin: 0 auto; padding: 80px var(--pad-x) 40px; }
    .grid { --min: 300px; margin-top: 28px; align-items: end; }
    .at { margin-bottom: 18px; }
    .title { margin: 0; font-family: var(--font-display); font-weight: 400; font-size: clamp(56px, 7vw, 104px); line-height: .9; letter-spacing: -.03em; }
    .text { font-size: 18px; line-height: 1.55; color: var(--body); margin: 20px 0 0; max-width: 460px; }
    .chips { display: flex; gap: 8px; margin-top: 22px; flex-wrap: wrap; font-size: 14px; }
    .chip { text-decoration: none; padding: 9px 15px; border-radius: var(--radius-pill); border: 1px solid rgba(0, 0, 0, .2); }
    .label { font-size: 12px; font-weight: 400; color: var(--muted); margin: 0 0 8px; }
    .row {
      display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 16px; align-items: baseline;
      padding: 18px 0; border-top: 1px solid var(--line); color: var(--black);
    }
    .row.last { border-bottom: 1px solid var(--line); }
    .pt { display: block; font-size: clamp(22px, 2.4vw, 30px); font-weight: 500; letter-spacing: -.02em; }
    .ps { display: block; font-size: 14px; color: var(--muted); margin-top: 4px; }
    @media (max-width: 760px) { .sec { padding: 56px 20px 24px; } }
  `,
})
export class PublicoComponent {
  readonly t = inject(I18n).t;
}

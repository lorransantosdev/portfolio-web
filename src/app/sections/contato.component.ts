import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18n } from '../core/i18n';
import { RevealDirective } from '../core/reveal.directive';
import { RiseComponent } from '../core/rise.component';
import { MagneticDirective } from '../core/magnetic.directive';
import { ChapterDirective } from '../core/chapter';
import { BinaryShapeComponent } from '../binary/binary-shape.component';
import { LINKS } from '../content/shared';

@Component({
  selector: 'app-contato',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, RiseComponent, MagneticDirective, ChapterDirective, BinaryShapeComponent],
  template: `
    <footer id="contato" [chapter]="t().contato.chapter" class="dark" aria-labelledby="contato-t">
      <div class="inner">
        <div class="col1">
          <div reveal class="env"><app-binary shape="envelope" [w]="230" [h]="160" ink="#f9f2ea" /></div>
          <h2 id="contato-t" class="title" [rise]="t().contato.titleA" [em]="t().contato.titleEm"></h2>
          <p class="lead">{{ t().contato.lead }}</p>
          <div class="ctas">
            <a magnetic class="btn cta light" [href]="links.mailto">{{ t().contato.ctaMail }}</a>
            <a magnetic class="btn cta line" [href]="links.whatsapp">{{ t().contato.ctaWhats }}</a>
          </div>
          <img reveal="clip" class="photo" src="assets/lorran-contato.webp" width="506" height="675" [alt]="t().contato.photoAlt" loading="lazy" decoding="async" />
        </div>
        <div class="col2">
          <h3 class="find mono">{{ t().contato.findLabel }}</h3>
          <div class="rows">
            @for (r of t().contato.rows; track r.k; let last = $last) {
              <a class="crow row" [class.big]="r.big" [class.last]="last" [href]="r.href">
                <span class="k mono">{{ r.k }}</span>
                <span class="v">{{ r.v }}</span>
                <span class="carr" aria-hidden="true">↗</span>
              </a>
            }
          </div>
        </div>
      </div>
      <div class="foot">
        <span class="fl"><img class="fmark" src="logo.svg" width="18" height="18" alt="" loading="lazy" />{{ t().contato.footerL }}</span><span class="mono">{{ t().contato.footerR }}</span>
      </div>
    </footer>
  `,
  styles: `
    :host { display: block; }
    .dark { background: var(--black); color: var(--cream); margin-top: 60px; }
    .inner {
      max-width: var(--container); margin: 0 auto; padding: 110px var(--pad-x) 60px;
      display: flex; flex-wrap: wrap; gap: 56px; align-items: flex-start;
    }
    .col1 { flex: 1 1 420px; min-width: 0; }
    .col2 { flex: 1 1 460px; min-width: 0; padding-top: 12px; }
    .env { margin-bottom: 26px; }
    .title { margin: 22px 0 0; font-family: var(--font-display); font-weight: 400; font-size: clamp(64px, 8vw, 124px); line-height: .86; letter-spacing: -.03em; }
        .lead { font-size: 18px; line-height: 1.55; opacity: .8; margin: 22px 0 0; max-width: 440px; }
    .ctas { display: flex; gap: 12px; margin-top: 28px; flex-wrap: wrap; }
    .cta { height: 56px; padding: 0 26px; font-size: 16px; }
    .cta.light { background: var(--cream); color: var(--black); }
    @media (hover: hover) and (pointer: fine) { .cta.light:hover { color: var(--red); } }
    .cta.line { border-color: rgba(249, 242, 234, .35); padding: 0 24px; }
    .photo { width: 240px; height: auto; aspect-ratio: 3 / 4; object-fit: cover; border-radius: var(--radius-card); margin-top: 44px; display: block; }
    .find { font-size: 12px; font-weight: 400; opacity: .55; margin: 0 0 10px; }
    .rows { display: flex; flex-direction: column; }
    .row {
      display: grid; grid-template-columns: 96px minmax(0, 1fr) auto; gap: 16px; align-items: baseline;
      padding: 13px 0; border-top: 1px solid var(--line-dark); color: var(--cream);
    }
    .row.big { padding: 18px 0; }
    .row.last { border-bottom: 1px solid var(--line-dark); }
    .k { font-size: 12px; opacity: .55; }
    .v { font-size: 18px; font-weight: 500; letter-spacing: -.01em; overflow-wrap: anywhere; }
    .row.big .v { font-size: clamp(20px, 2.2vw, 28px); }
    .foot {
      max-width: var(--container); margin: 0 auto; padding: 24px var(--pad-x); border-top: 1px solid var(--line-dark);
      display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; font-size: 13px; opacity: .7;
    }
    .fl { display: inline-flex; align-items: center; gap: 8px; }
    .fmark { width: 18px; height: 18px; }
    @media (max-width: 760px) {
      .dark { margin-top: 24px; }
      .inner { padding: 64px 20px; }
      .row { grid-template-columns: 78px minmax(0, 1fr) auto; gap: 10px; }
    }
  `,
})
export class ContatoComponent {
  readonly t = inject(I18n).t;
  readonly links = LINKS;
}

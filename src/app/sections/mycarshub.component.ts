import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18n } from '../core/i18n';
import { RevealDirective } from '../core/reveal.directive';
import { RiseComponent } from '../core/rise.component';
import { DriftDirective } from '../core/drift.directive';
import { MagneticDirective } from '../core/magnetic.directive';
import { ChapterDirective } from '../core/chapter';
import { BinaryShapeComponent } from '../binary/binary-shape.component';
import { ContractDemoComponent } from './contract-demo.component';
import { StackPilhaComponent } from './stack-pilha.component';
import { GithubGridComponent } from './github-grid.component';

@Component({
  selector: 'app-mycarshub',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RevealDirective, RiseComponent, DriftDirective, MagneticDirective, ChapterDirective, BinaryShapeComponent,
    ContractDemoComponent, StackPilhaComponent, GithubGridComponent,
  ],
  template: `
    <section id="mycarshub" [chapter]="t().mycarshub.chapter" [say]="t().mycarshub.say" class="sec" aria-labelledby="mch-t">
      <div class="head">
        <h2 id="mch-t" class="title" rise="MyCarsHub"></h2>
        <p class="lead">{{ t().mycarshub.lead }}</p>
      </div>

      <p reveal class="story">{{ t().mycarshub.story.a }}<span class="muted">{{ t().mycarshub.story.b }}</span>{{ t().mycarshub.story.c }}<span class="red">{{ t().mycarshub.story.d }}</span></p>

      <div class="car"><app-binary shape="carro" [w]="460" [h]="200" ink="#000000" /></div>

      <app-contract-demo />

      <div class="dash">
        <div reveal="clip" class="win">
          <div class="bar">
            <span class="d" style="background: #ff5f57"></span><span class="d" style="background: #febc2e"></span><span class="d" style="background: #28c840"></span>
            <span class="url mono">{{ t().mycarshub.dashLabel }}</span>
          </div>
          <img src="assets/mycarshub-dashboard.webp" width="1192" height="677" [alt]="t().mycarshub.dashAlt" loading="lazy" decoding="async" />
        </div>
        <img class="phone" [drift]="-.14" src="assets/mycarshub-celular.webp" width="289" height="573" [alt]="t().mycarshub.phoneAlt" loading="lazy" decoding="async" />
        <div class="pay">
          <div class="pt">{{ t().mycarshub.badgeTitle }}</div>
          <div class="ps">{{ t().mycarshub.badgeSub }}</div>
        </div>
      </div>

      <div class="built">
        <h3 class="bt">{{ t().mycarshub.builtTitle }}</h3>
        <div class="bgrid">
          @for (g of t().mycarshub.built; track g.t) {
            <div reveal class="bcell">
              <div class="bk mono">{{ g.t }}</div>
              <div class="chips">
                @for (k of g.items; track k[0]) {
                  <span class="chip mono" [class.solid]="k[1] === 1">{{ k[0] }}</span>
                }
              </div>
            </div>
          }
        </div>
      </div>

      <app-stack-pilha />
      <app-github-grid />

      <div class="ctas">
        <a magnetic class="btn btn-dark btn-lg" [href]="t().mycarshub.ctaProduct.href">{{ t().mycarshub.ctaProduct.label }}</a>
        <a magnetic class="btn btn-line btn-lg" [href]="t().mycarshub.ctaSeries.href">{{ t().mycarshub.ctaSeries.label }}</a>
      </div>
      <p reveal class="next">{{ t().mycarshub.next }} <span class="bob" aria-hidden="true">↓</span></p>
    </section>
  `,
  styles: `
    :host { display: block; }
    .sec { max-width: var(--container); margin: 0 auto; padding: 120px var(--pad-x) 40px; }
    .head { display: flex; justify-content: space-between; align-items: flex-end; gap: 30px; flex-wrap: wrap; margin-top: 18px; }
    .title { margin: 0; font-family: var(--font-display); font-weight: 400; font-size: clamp(72px, 11vw, 168px); line-height: .85; letter-spacing: -.04em; }
    .lead { margin: 0 0 14px; max-width: 360px; font-size: 18px; line-height: 1.5; color: var(--body-2); }
    .story { margin: 50px 0 0; max-width: 900px; font-size: clamp(24px, 2.6vw, 34px); line-height: 1.35; letter-spacing: -.015em; font-weight: 500; }
    .muted { color: var(--muted); }
    .red { color: var(--red); }
    .car { display: flex; flex-direction: column; align-items: center; margin-top: 70px; gap: 8px; }

    .dash { margin-top: 36px; border-radius: var(--radius-card-lg); background: var(--red); position: relative; padding: 64px 56px 0; overflow: clip; }
    .win { max-width: 920px; margin: 0 auto; border-radius: 14px 14px 0 0; overflow: hidden; box-shadow: 0 50px 90px -30px rgba(0, 0, 0, .65); background: #141414; }
    .bar { height: 34px; display: flex; align-items: center; gap: 7px; padding: 0 14px; background: #1f1f1f; }
    .d { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
    .url { margin-left: 14px; font-size: 11px; color: #8a8a8a; }
    .win img { width: 100%; height: auto; display: block; }
    .phone {
      position: absolute; right: 4%; bottom: -30px; width: 21%; max-width: 230px; height: auto;
      border-radius: 34px; box-shadow: 0 40px 70px -20px rgba(0, 0, 0, .7);
    }
    .pay { position: absolute; left: 0; top: 0; background: var(--black); color: var(--cream); padding: 16px 20px; border-radius: 0 0 18px 0; }
    .pt { font-size: 26px; font-weight: 600; letter-spacing: -.03em; }
    .ps { font-size: 13px; opacity: .75; }

    .built { margin-top: 50px; }
    .bt { margin: 0; font-size: 20px; font-weight: 500; }
    .bgrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-top: 16px; border-top: 1px solid var(--line); }
    .bcell { padding: 18px 18px 18px 0; border-bottom: 1px solid var(--line); }
    .bk { font-size: 12px; color: var(--muted); }
    .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
    .chip { font-size: 12px; padding: 6px 11px; border-radius: var(--radius-pill); border: 1px solid rgba(0, 0, 0, .2); }
    .chip.solid { background: var(--black); color: var(--cream); border-color: var(--black); }

    .ctas { display: flex; gap: 12px; margin-top: 30px; flex-wrap: wrap; }
    @media (max-width: 760px) {
      .sec { padding: 56px 20px 24px; }
      .car { margin-top: 40px; }
      .dash { padding: 84px 12px 0; }
      .phone { width: 34%; right: 2%; bottom: -10px; }
      .bgrid { grid-template-columns: minmax(0, 1fr); }
    }
  `,
})
export class MycarshubComponent {
  readonly t = inject(I18n).t;
}

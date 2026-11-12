import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { I18n } from '../core/i18n';
import { SeoService } from '../core/seo.service';
import { Lang } from '../content/types';
import { NavComponent } from '../sections/nav.component';
import { HeroComponent } from '../sections/hero.component';
import { IntroComponent } from '../sections/intro.component';
import { OrigemComponent } from '../sections/origem.component';
import { FiapComponent } from '../sections/fiap.component';
import { CieloComponent } from '../sections/cielo.component';
import { MycarshubComponent } from '../sections/mycarshub.component';
import { PublicoComponent } from '../sections/publico.component';
import { ScottComponent } from '../sections/scott.component';
import { ContatoComponent } from '../sections/contato.component';
import { MiniScottComponent } from '../sections/mini-scott.component';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NavComponent, HeroComponent, IntroComponent, OrigemComponent, FiapComponent, CieloComponent,
    MycarshubComponent, PublicoComponent, ScottComponent, ContatoComponent, MiniScottComponent,
  ],
  template: `
    <a class="skip-link" [href]="(t().path === '/' ? '/' : t().path) + '#historia'">{{ t().lang === 'pt' ? 'Pular para o conteúdo' : 'Skip to content' }}</a>
    <div class="page">
      <app-nav />
      <main>
        <app-hero />
        <app-intro />
        <app-origem />
        <app-fiap />
        <app-cielo />
        <app-mycarshub />
        <app-publico />
        <app-scott />
      </main>
      <app-contato />
      <app-mini-scott />
    </div>
  `,
  styles: `
    .page { width: 100%; position: relative; overflow: clip; }
  `,
})
export default class HomePage {
  private i18n = inject(I18n);
  readonly t = this.i18n.t;

  constructor() {
    const lang = (inject(ActivatedRoute).snapshot.data['lang'] as Lang) ?? 'pt';
    this.i18n.lang.set(lang);
    inject(SeoService).apply(this.i18n.t());
  }
}

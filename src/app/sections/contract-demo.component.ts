import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChild,
} from '@angular/core';
import { I18n } from '../core/i18n';
import { MotionService } from '../core/motion.service';
import { BinaryShapeComponent } from '../binary/binary-shape.component';

@Component({
  selector: 'app-contract-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BinaryShapeComponent],
  template: `
    <div #root class="ai">
      <div>
        <div class="spark"><app-binary shape="faisca" [w]="120" [h]="120" ink="#f9f2ea" /></div>
        <h3 class="aititle">{{ t().mycarshub.aiTitle.a }}<br />{{ t().mycarshub.aiTitle.b }}<em>{{ t().mycarshub.aiTitle.em }}</em>{{ t().mycarshub.aiTitle.c }}</h3>
        <div class="steps">
          @for (c of t().mycarshub.steps; track c.n; let i = $index) {
            <button type="button" class="step" [class.on]="i === step()" [attr.aria-pressed]="i === step()" (click)="go(i)">
              <span class="sn mono" aria-hidden="true">{{ c.n }}</span>
              <span class="sb"><span class="st">{{ c.t }}</span><span class="sd">{{ c.d }}</span></span>
            </button>
          }
        </div>
      </div>
      <div class="doc">
        <div class="dh">
          <span class="dt">{{ t().mycarshub.contractTitle }}</span>
          <span class="badge mono" [class]="'s' + step()">{{ t().mycarshub.badges[step()] }}</span>
        </div>
        <div class="hr"></div>
        @for (l of t().mycarshub.lines; track $index) {
          <div class="ln">{{ l.label }} <span class="v" [class]="'s' + step()">{{ step() === 2 ? l.ph : l.v }}</span></div>
        }
        <div class="bar" style="width: 92%; margin-top: 12px"></div>
        <div class="bar" style="width: 70%; margin-top: 8px"></div>
        <div class="sample mono">{{ t().mycarshub.sample }}</div>
      </div>
    </div>
  `,
  styles: `
    :host { display: block; }
    .ai {
      margin-top: 70px; background: var(--black); color: var(--cream); border-radius: var(--radius-card-xl); padding: 48px;
      display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 48px; align-items: center;
    }
    .spark { margin-bottom: 18px; }
    .aititle { margin: 14px 0 0; font-family: var(--font-display); font-weight: 400; font-size: clamp(38px, 4vw, 56px); line-height: 1; letter-spacing: -.02em; }
    .steps { display: flex; flex-direction: column; margin-top: 30px; }
    .step {
      display: flex; gap: 14px; align-items: flex-start; background: none; border: 0;
      border-top: 1px solid var(--line-dark); padding: 16px 0; color: var(--cream); font: inherit;
      cursor: pointer; text-align: left;
    }
    .sb { opacity: .62; transition: opacity .3s; }
    .step.on .sb, .step:hover .sb { opacity: 1; }
    .sn { font-size: 12px; color: var(--red-on-dark); width: 26px; flex: 0 0 auto; }
    .sb { display: flex; flex-direction: column; text-align: left; }
    .st { font-size: 17px; font-weight: 600; }
    .sd { font-size: 14px; opacity: .8; margin-top: 2px; }
    .doc {
      background: var(--cream); color: var(--black); border-radius: var(--radius-card-sm); padding: 28px 30px;
      box-shadow: 0 40px 70px -40px rgba(217, 29, 4, .6); position: relative; min-width: 0;
    }
    .dh { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
    .dt { font-weight: 700; font-size: 14px; letter-spacing: .02em; }
    .badge { font-size: 11px; padding: 5px 10px; border-radius: var(--radius-pill); white-space: nowrap; transition: background .3s, color .3s; }
    .badge.s0 { background: rgba(0, 0, 0, .07); color: var(--black); }
    .badge.s1 { background: var(--black); color: var(--cream); }
    .badge.s2 { background: var(--red); color: var(--cream); }
    .hr { height: 1px; background: rgba(0, 0, 0, .12); margin: 14px 0 6px; }
    .ln { font-size: 15px; line-height: 2.1; }
    .v.s0 { font-weight: 500; }
    .v.s1 { font-weight: 500; background: rgba(217, 29, 4, .14); border-bottom: 2px solid var(--red); padding: 1px 4px; }
    .v.s2 {
      font-family: var(--font-mono); font-size: 13px; color: var(--red); background: rgba(217, 29, 4, .08);
      border: 1px solid rgba(217, 29, 4, .35); border-radius: 6px; padding: 2px 6px; overflow-wrap: anywhere;
    }
    .bar { height: 6px; background: rgba(0, 0, 0, .07); border-radius: 3px; }
    .sample { font-size: 10px; color: var(--muted); margin-top: 16px; }
    @media (max-width: 760px) {
      .ai { padding: 24px 20px; gap: 28px; margin-top: 40px; grid-template-columns: minmax(0, 1fr); }
      .doc { padding: 20px; }
    }
  `,
})
export class ContractDemoComponent {
  readonly t = inject(I18n).t;
  readonly step = signal(0);
  private lastStep = 0;
  private root = viewChild.required<ElementRef<HTMLElement>>('root');

  go(i: number): void {
    this.lastStep = Date.now();
    this.step.set(i);
  }

  constructor() {
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      let timer: ReturnType<typeof setInterval> | undefined;
      const stopIO = motion.observe(this.root().nativeElement, (e) => {
        if (e.isIntersecting && !timer) {
          this.lastStep = Date.now();
          timer = setInterval(() => {
            if (Date.now() - this.lastStep > 3200) {
              this.lastStep = Date.now();
              this.step.update((s) => (s + 1) % 3);
            }
          }, 400);
        } else if (!e.isIntersecting && timer) {
          clearInterval(timer);
          timer = undefined;
        }
      });
      destroyRef.onDestroy(() => { stopIO(); clearInterval(timer); });
    });
  }
}

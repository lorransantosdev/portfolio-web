import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, viewChild, viewChildren,
} from '@angular/core';
import { I18n } from '../core/i18n';
import { MotionService } from '../core/motion.service';
import { RevealDirective } from '../core/reveal.directive';
import { RiseComponent } from '../core/rise.component';
import { ChapterDirective } from '../core/chapter';
import { DecryptComponent } from '../core/decrypt.component';
import { ArrowLabelComponent } from '../core/arrow-label.component';
import { BinaryShapeComponent } from '../binary/binary-shape.component';

@Component({
  selector: 'app-cielo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, RiseComponent, ChapterDirective, DecryptComponent, ArrowLabelComponent, BinaryShapeComponent],
  template: `
    <section #sec id="cielo" [chapter]="t().cielo.chapter" [say]="t().cielo.say" class="dark" aria-labelledby="cielo-t">
      <div class="wrap inner">
        <div class="autogrid grid">
          <div>
            <h2 id="cielo-t" class="title" rise="Cielo"></h2>
            <p class="lead">{{ t().cielo.lead }}</p>
            <div class="roles">
              <div class="role">
                <span class="bullet on" aria-hidden="true"></span>
                <span class="rt">{{ t().cielo.roleCurrent.title }}</span>
                <span class="rd mono">{{ t().cielo.roleCurrent.dates }}</span>
              </div>
              <div class="role last">
                <span class="bullet" aria-hidden="true"></span>
                <span class="rt prev">{{ t().cielo.rolePrev.title }} <span class="note">{{ t().cielo.rolePrev.note }}</span></span>
                <span class="rd mono">{{ t().cielo.rolePrev.dates }}</span>
              </div>
            </div>
            <a class="ul li tap" [href]="t().cielo.linkedin.href" [arrowLabel]="t().cielo.linkedin.label"></a>
            <div class="dolabel mono" [decrypt]="t().cielo.doLabel"></div>
            <div class="does">
              @for (d of t().cielo.does; track $index) {
                <div reveal class="do">{{ d }}</div>
              }
              <div reveal class="do">{{ t().cielo.doAi.text }} <span class="ph">{{ t().cielo.doAi.placeholder }}</span></div>
              <div reveal class="do ph">{{ t().cielo.doNumber }}</div>
            </div>
          </div>
          <div class="cardcol">
            <div #card class="card"><app-binary shape="cartao" [w]="440" [h]="280" ink="#f9f2ea" /></div>
            <div class="cap mono">{{ t().cielo.cardCaption }}</div>
          </div>
        </div>

        <div class="block">
          <div class="bh">
            <h3 class="bt">{{ t().cielo.flowTitle }}</h3>
            <div class="bn mono" [decrypt]="t().cielo.flowNote"></div>
          </div>
          <div #flow class="flow">
            <div #line class="line" aria-hidden="true"></div>
            <div #pulse class="pulse" aria-hidden="true"></div>
            <ol class="flowg">
              @for (n of t().cielo.flow; track n.i) {
                <li reveal>
                  <div #fnode class="fnode">
                    <div class="circ mono" aria-hidden="true">{{ n.i }}</div>
                    <div class="ft">{{ n.t }}</div>
                    <div class="fd">{{ n.d }}</div>
                    <div class="tags">
                      @for (k of n.s; track k) { <span class="tag mono">{{ k }}</span> }
                    </div>
                  </div>
                </li>
              }
            </ol>
          </div>
        </div>

        <div class="block">
          <p reveal class="qlead">{{ t().cielo.questionsLead }}</p>
          @for (q of t().cielo.questions; track $index) {
            <div reveal class="q4"><span class="qq">{{ q.q }}</span><span class="qa">{{ q.a }}</span></div>
          }
        </div>
        <p reveal class="next on-dark">{{ t().cielo.next }} <span class="bob" aria-hidden="true">↓</span></p>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }
    .dark { background: var(--black); color: var(--cream); margin-top: 60px; }
    @media (hover: hover) and (pointer: fine) { .dark a:hover { color: var(--red); } }
    .inner { padding-top: 110px; padding-bottom: 110px; }
    .grid { --min: 320px; margin-top: 28px; align-items: start; }
    .title { margin: 0; font-family: var(--font-display); font-weight: 400; font-size: clamp(64px, 8vw, 120px); line-height: .88; letter-spacing: -.03em; }
    .lead { font-size: 20px; line-height: 1.5; margin: 18px 0 0; max-width: 460px; opacity: .85; }
    .roles { margin-top: 34px; display: flex; flex-direction: column; }
    .role {
      display: grid; grid-template-columns: 18px minmax(0, 1fr) auto; gap: 14px; align-items: baseline;
      padding: 14px 0; border-top: 1px solid rgba(249, 242, 234, .2);
    }
    .role.last { border-bottom: 1px solid rgba(249, 242, 234, .2); }
    .bullet { width: 10px; height: 10px; border-radius: 50%; border: 1px solid var(--cream); display: inline-block; }
    .bullet.on { background: var(--red); border-color: var(--red); }
    .rt { font-size: 18px; font-weight: 600; }
    .rt.prev { font-weight: 400; opacity: .8; }
    .note { font-size: 14px; opacity: .7; }
    .rd { font-size: 12px; opacity: .65; white-space: nowrap; }
    .li { display: inline-block; margin-top: 14px; font-size: 14px; color: var(--cream); opacity: .75; }
    .dolabel { font-size: 12px; opacity: .6; margin-top: 30px; }
    .does { display: flex; flex-direction: column; margin-top: 6px; }
    .do { padding: 12px 0; border-bottom: 1px solid rgba(249, 242, 234, .14); font-size: 16px; line-height: 1.5; }
    .ph { color: var(--placeholder); }
    .cardcol { display: flex; flex-direction: column; align-items: flex-end; gap: 18px; padding-top: 40px; }
    .card { transform-style: preserve-3d; will-change: transform; width: 100%; max-width: 440px; }
    .cap { font-size: 11px; opacity: .55; width: 100%; max-width: 440px; text-align: center; }
    .block { margin-top: 90px; }
    .bh { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 12px; }
    .bt { margin: 0; font-size: 22px; font-weight: 500; }
    .bn { font-size: 11px; opacity: .55; }
    .flow { position: relative; margin-top: 30px; }
    .line { position: absolute; left: 0; right: 0; top: 23px; height: 1px; background: rgba(249, 242, 234, .25); }
    .pulse {
      position: absolute; left: 0; top: 18px; width: 11px; height: 11px; border-radius: 50%;
      background: var(--red); box-shadow: 0 0 0 6px rgba(217, 29, 4, .25);
    }
    .flowg { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 14px; position: relative; list-style: none; margin: 0; padding: 0; }
    .fnode { transition: opacity var(--duration-slow) var(--ease-smooth-out); }
    .circ { transition: background var(--duration-fast), border-color var(--duration-fast), scale var(--duration-slow) var(--ease-bounce); }
    .fnode.lit .circ { scale: 1.08; }
    .fnode.lit .circ { border-color: var(--red); }
    .circ {
      width: 46px; height: 46px; border-radius: 50%; background: var(--black); border: 1px solid rgba(249, 242, 234, .4);
      display: flex; align-items: center; justify-content: center; font-size: 12px;
    }
    .ft { font-size: 17px; font-weight: 600; margin-top: 14px; }
    .fd { font-size: 13px; opacity: .65; margin-top: 4px; min-height: 36px; }
    .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
    .tag { font-size: 11px; padding: 5px 9px; border-radius: var(--radius-pill); border: 1px solid rgba(249, 242, 234, .3); }
    .qlead { font-size: 20px; margin: 0 0 18px; opacity: .8; }
    .q4 {
      display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 24px; padding: 20px 0;
      border-top: 1px solid var(--line-dark); align-items: baseline;
    }
    .qq { font-size: clamp(24px, 2.6vw, 34px); font-weight: 500; letter-spacing: -.02em; }
    .qa { font-size: 16px; line-height: 1.55; opacity: .7; }

    @media (max-width: 760px) {
      .dark { margin-top: 24px; }
      .inner { padding-top: 64px; padding-bottom: 64px; }
      .role { grid-template-columns: 18px minmax(0, 1fr); row-gap: 4px; }
      .role > .rd { grid-column: 2; }
      .rt { font-size: 16px; }
      .line { left: 23px; right: auto; width: 1px; height: 0; }
      .pulse { left: 18px; top: 0; transition: none; }
      .flowg { grid-template-columns: minmax(0, 1fr); gap: 20px; }
      .fnode { display: grid; grid-template-columns: 46px minmax(0, 1fr); column-gap: 14px; align-items: start; }
      .fnode > * { grid-column: 2; }
      .fnode > .circ { grid-column: 1; grid-row: 1 / span 3; }
      .ft { margin-top: 0; }
      .fd { min-height: 0; }
      .q4 { grid-template-columns: minmax(0, 1fr); gap: 6px; padding: 16px 0; }
      .cardcol { align-items: center; }
      .block { margin-top: 56px; }
    }
  `,
})
export class CieloComponent {
  readonly t = inject(I18n).t;
  private sec = viewChild.required<ElementRef<HTMLElement>>('sec');
  private card = viewChild.required<ElementRef<HTMLElement>>('card');
  private pulse = viewChild.required<ElementRef<HTMLElement>>('pulse');
  private flow = viewChild.required<ElementRef<HTMLElement>>('flow');
  private line = viewChild.required<ElementRef<HTMLElement>>('line');
  private fnodes = viewChildren<ElementRef<HTMLElement>>('fnode');

  constructor() {
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const card = this.card().nativeElement;
      const pulse = this.pulse().nativeElement;
      const line = this.line().nativeElement;
      const nodes = this.fnodes().map((r) => r.nativeElement);
      const narrow = window.matchMedia('(max-width: 760px)');
      let fk = -1, vertical = false, ys: number[] = [];
      const measure = () => {
        vertical = narrow.matches;
        ys = vertical ? nodes.map((n) => n.offsetTop + 23) : [];
        if (vertical) {
          line.style.top = ys[0] + 'px';
          line.style.height = ys[ys.length - 1] - ys[0] + 'px';
          pulse.style.left = '';
          pulse.style.translate = '0 ' + (ys[0] - 5.5) + 'px';
        } else {
          line.style.removeProperty('top');
          line.style.removeProperty('height');
          pulse.style.removeProperty('translate');
        }
      };
      measure();
      const ro = new ResizeObserver(measure);
      ro.observe(this.flow().nativeElement);
      destroyRef.onDestroy(() => ro.disconnect());
      const light = (k: number) => {
        if (fk === k) return;
        fk = k;
        nodes.forEach((n, i) => {
          n.style.opacity = i <= k ? '1' : '.45';
          n.classList.toggle('lit', i === k);
        });
      };
      const tick = (now: number) => {
        const t = now / 1000;
        if (!motion.reduced) card.style.transform =
          'perspective(900px) rotateY(' + (Math.sin(t * .6) * 14).toFixed(2) + 'deg) rotateX(' + (Math.cos(t * .5) * 6).toFixed(2) + 'deg)';
        const p = (t * .22) % 1;
        pulse.style.opacity = p > .96 ? '0' : '1';
        if (vertical) {
          const top = ys[0], span = ys[ys.length - 1] - top, q = Math.min(1, p / .9);
          const y = top + q * span;
          pulse.style.translate = '0 ' + (y - 5.5).toFixed(1) + 'px';
          let k = 0;
          while (k < ys.length - 1 && y >= ys[k + 1] - 12) k++;
          light(k);
          return;
        }
        pulse.style.left = (p * 100).toFixed(2) + '%';
        light(Math.min(4, Math.floor(p * 5.2)));
      };
      let stopTick: (() => void) | null = null;
      const stopIO = motion.observe(this.sec().nativeElement, (e) => {
        if (e.isIntersecting) { if (!stopTick) stopTick = motion.add(tick); }
        else if (stopTick) { stopTick(); stopTick = null; }
      });
      destroyRef.onDestroy(() => { stopIO(); stopTick?.(); });
    });
  }
}

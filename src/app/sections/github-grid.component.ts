import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChild,
} from '@angular/core';
import { I18n } from '../core/i18n';
import { MotionService } from '../core/motion.service';
import { CountUpComponent } from '../core/countup.component';
import { GH_LEVELS, GH_START, GH_TOTAL } from '../content/shared';
import { FONT_MONO, dprCap, fontsReady } from '../binary/shapes';

const COL = ['rgba(0,0,0,.2)', 'rgba(217,29,4,.4)', 'rgba(217,29,4,.65)', '#d91d04', '#a50f01'];
const TOP = 22;
const GS = 64; // tamanho do glifo em cache (px)
const GF = 44; // tamanho da fonte dentro do glifo

interface Cell { l: number; c: number; r: number; d: Date; g: '0' | '1'; s: number }

const DOTS = Array.from({ length: 16 }, (_, i) => i % 4);

@Component({
  selector: 'app-github-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CountUpComponent],
  template: `
    <div class="head">
      <div>
        <h3 class="title">{{ t().mycarshub.ghTitle }}</h3>
        <div class="sub"><span [countUp]="total" [locale]="t().locale"></span>{{ t().mycarshub.ghSuffix }}</div>
      </div>
      <div class="legend mono" aria-hidden="true">
        {{ t().mycarshub.ghLess }}
        <span style="color: rgba(0,0,0,.22)">0</span><span class="b" style="color: rgba(217,29,4,.4)">1</span><span class="b" style="color: rgba(217,29,4,.65)">1</span><span class="b" style="color: #d91d04">1</span><span class="b" style="color: #a50f01">1</span>
        {{ t().mycarshub.ghMore }}
      </div>
    </div>
    <div class="gwrap">
      <canvas #cv class="gh" role="img" [attr.aria-label]="t().mycarshub.ghAria"></canvas>
      @if (!ready()) {
        <div class="mx" aria-hidden="true">@for (c of dots; track $index) {<i [style.--d]="c"></i>}</div>
      }
      <div #tip class="ghtip mono" aria-hidden="true" data-show="false"></div>
    </div>
  `,
  styles: `
    :host { display: block; margin-top: 64px; }
    .head { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; flex-wrap: wrap; }
    .title { margin: 0; font-size: 20px; font-weight: 500; }
    .sub { font-size: 15px; color: var(--muted); margin-top: 6px; }
    .legend { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--muted); }
    .legend .b { font-weight: 700; }
    .gwrap { position: relative; margin-top: 18px; overflow-x: auto; }
    .gh { display: block; width: 100%; min-width: 760px; height: 180px; cursor: crosshair; touch-action: pan-y; }
    .ghtip {
      position: absolute; left: 0; top: 0; pointer-events: none; opacity: 0;
      translate: var(--tt-x, 0px) var(--tt-y, 0px); scale: var(--scale-small); transform-origin: 0 100%;
      font-size: 11px; background: var(--black); color: var(--cream); padding: 6px 9px; border-radius: 8px; white-space: nowrap;
      transition:
        opacity var(--tt-out-dur) var(--ease-out), scale var(--tt-out-dur) var(--ease-out),
        translate var(--tt-move-dur) var(--ease-smooth-out);
    }
    .ghtip[data-show='true'] {
      opacity: 1; scale: 1;
      transition:
        opacity var(--tt-in-dur) var(--ease-out) var(--tt-delay), scale var(--tt-in-dur) var(--ease-out) var(--tt-delay),
        translate var(--tt-move-dur) var(--ease-smooth-out);
    }
    .mx {
      position: absolute; left: 50%; top: 50%; translate: -50% -50%; display: grid;
      grid-template-columns: repeat(4, 4px); grid-auto-rows: 4px; gap: 4px;
      animation: mx-in var(--duration-fast) var(--ease-out) 200ms both;
    }
    .mx i {
      display: block; border-radius: 1px; background: rgba(0, 0, 0, .12);
      animation: mx var(--matrix-cycle) var(--ease-in-out) infinite; animation-delay: calc(var(--d) * var(--matrix-cycle) / 10);
    }
    @keyframes mx { 0%, 45%, 100% { background-color: rgba(0, 0, 0, .12); } 15% { background-color: var(--red); } }
    @keyframes mx-in { from { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) {
      .ghtip { transition: opacity var(--tt-in-dur) var(--ease-out); }
      .mx i { animation: none; }
    }
    @media (max-width: 760px) {
      :host { margin-top: 48px; }
      .gh { min-width: 0; height: 117px; }
    }
  `,
})
export class GithubGridComponent {
  readonly t = inject(I18n).t;
  readonly total = GH_TOTAL;
  readonly dots = DOTS;
  readonly ready = signal(false);
  private cv = viewChild.required<ElementRef<HTMLCanvasElement>>('cv');
  private tip = viewChild.required<ElementRef<HTMLElement>>('tip');
  private motion = inject(MotionService);
  private destroyRef = inject(DestroyRef);
  private destroyed = false;

  constructor() {
    this.destroyRef.onDestroy(() => (this.destroyed = true));
    afterNextRender(() => {
      fontsReady().then(() => !this.destroyed && this.init());
    });
  }

  private init(): void {
    const cv = this.cv().nativeElement, tip = this.tip().nativeElement;
    const calm = this.motion.reduced;
    const MON = this.t().mycarshub.ghMonths, LBL = this.t().mycarshub.ghLevels;
    const p = GH_START.split('-').map(Number);
    const t0 = Date.UTC(p[0], p[1] - 1, p[2]);
    const cells: Cell[] = GH_LEVELS.split('').map(Number).map((l, i) => ({
      l, c: Math.floor(i / 7), r: i % 7, d: new Date(t0 + i * 864e5), g: l ? '1' : '0', s: 1,
    }));
    const ALLC = cells[cells.length - 1].c + 1;

    const glyph = (col: string, weight: number) => {
      const o = {} as Record<'0' | '1', HTMLCanvasElement>;
      (['0', '1'] as const).forEach((dg) => {
        const c = document.createElement('canvas');
        c.width = c.height = GS;
        const x = c.getContext('2d')!;
        x.font = `${weight} ${GF}px ${FONT_MONO}`; x.fillStyle = col; x.textAlign = 'center'; x.textBaseline = 'middle';
        x.fillText(dg, GS / 2, GS / 2 + 2);
        o[dg] = c;
      });
      return o;
    };
    const GLY = COL.map((c, l) => glyph(c, l ? 700 : 400));

    let W = 0, H = 0, step = 0, dpr = 1, off = 0, COLS = ALLC;
    let mx = -999, my = -999, start = 0, seen = false;
    const scanning = this.motion.coarse;
    let visible = false, scanX = -999;
    const labels = document.createElement('canvas');

    const size = () => {
      const pw = cv.parentElement ? cv.parentElement.clientWidth : 1100;
      off = pw && pw < 700 ? ALLC - 26 : 0;
      COLS = ALLC - off;
      const w = cv.clientWidth || 1100;
      dpr = dprCap();
      step = w / COLS; W = w; H = TOP + step * 7;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.height = H + 'px';
      labels.width = cv.width; labels.height = Math.round(TOP * dpr);
      const lg = labels.getContext('2d')!;
      lg.setTransform(dpr, 0, 0, dpr, 0, 0);
      lg.font = `11px ${FONT_MONO}`; lg.fillStyle = '#6b625c'; lg.textBaseline = 'alphabetic';
      let lastM = -1;
      cells.forEach((q) => {
        if (q.c >= off && q.r === 0 && q.d.getUTCDate() <= 7 && q.d.getUTCMonth() !== lastM) {
          lastM = q.d.getUTCMonth();
          lg.fillText(MON[lastM], (q.c - off) * step, 12);
        }
      });
    };

    const g = cv.getContext('2d')!;
    const draw = (now: number): boolean => {
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, cv.width, cv.height);
      g.drawImage(labels, 0, 0);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const el = (now - start) / 1000;
      let busy = false;
      const fs = Math.max(9, step * .78);
      const lead = (ALLC - 1) * .018 + .6;
      scanX = scanning && visible && el > lead
        ? -step * 3 + (W + step * 6) * ((((el - lead) / 9) % 1) / .8)
        : -999;
      for (const q of cells) {
        if (q.c < off) continue;
        const x = (q.c - off) * step + step / 2, y = TOP + q.r * step + step / 2;
        const appear = Math.min(1, Math.max(0, (el - q.c * .018) / .35));
        if (appear < 1 && seen) busy = true;
        let ch = q.g;
        const dx = x - mx, dy = y - my, dd = Math.sqrt(dx * dx + dy * dy);
        const near = Math.max(0, 1 - dd / (step * 3.2), .8 - Math.abs(x - scanX) / (step * 2.4));
        const target = 1 + near * (calm ? .3 : .9);
        q.s += (target - q.s) * .25;
        if (Math.abs(target - q.s) > .01) busy = true;
        if (appear < 1 && appear > 0 && Math.random() < .5) ch = Math.random() < .5 ? '0' : '1';
        if (near > .45 && Math.random() < .12) { ch = q.g === '1' ? '0' : '1'; busy = true; }
        if (appear <= 0) continue;
        const sz = (fs * q.s * GS) / GF;
        g.globalAlpha = appear;
        g.drawImage(GLY[q.l][ch], x - sz / 2, y - sz / 2, sz, sz);
      }
      g.globalAlpha = 1;
      return busy || mx > -999 || (scanning && visible);
    };

    let running: (() => void) | null = null;
    const kick = () => {
      if (running) return;
      running = this.motion.add((now) => {
        const keep = draw(now);
        if (!keep) running = null;
        return keep;
      });
    };

    size();
    draw(performance.now());
    this.ready.set(true);
    let rsz = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(rsz);
      rsz = requestAnimationFrame(() => { size(); kick(); });
    });
    ro.observe(cv);
    const stopIO = this.motion.observe(
      cv,
      (e) => {
        visible = e.isIntersecting;
        if (visible && !seen) { seen = true; start = performance.now(); }
        if (visible) kick();
      },
      { threshold: .3 },
    );

    const showTip = (e: MouseEvent): boolean => {
      const b = cv.getBoundingClientRect();
      mx = e.clientX - b.left; my = e.clientY - b.top;
      const c = Math.floor(mx / step), r = Math.floor((my - TOP) / step), q = cells[(c + off) * 7 + r];
      if (q && c >= 0 && r >= 0 && r < 7) {
        tip.textContent = q.d.getUTCDate() + ' ' + MON[q.d.getUTCMonth()] + ' ' + q.d.getUTCFullYear() + ' · ' + LBL[q.l];
        const x = Math.max(0, Math.min(mx + 12, b.width - 170)), y = my - 34;
        const showing = tip.dataset['show'] === 'true';
        if (!showing) tip.style.transition = 'none';
        tip.style.setProperty('--tt-x', x + 'px');
        tip.style.setProperty('--tt-y', y + 'px');
        if (!showing) {
          void tip.offsetWidth;
          tip.style.transition = '';
        }
        tip.dataset['show'] = 'true';
        return true;
      }
      tip.dataset['show'] = 'false';
      return false;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      showTip(e);
      kick();
    };
    const leave = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      mx = my = -999; tip.dataset['show'] = 'false'; kick();
    };
    let tipTimer: ReturnType<typeof setTimeout> | undefined;
    const click = (e: MouseEvent) => {
      if (this.motion.coarse) {
        clearTimeout(tipTimer);
        if (showTip(e)) kick();
        tipTimer = setTimeout(() => { mx = my = -999; tip.dataset['show'] = 'false'; kick(); }, 2000);
        return;
      }
      start = performance.now(); cells.forEach((q) => (q.s = 1.6)); kick();
    };
    cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerleave', leave);
    cv.addEventListener('click', click);
    this.destroyRef.onDestroy(() => {
      ro.disconnect(); cancelAnimationFrame(rsz); stopIO(); running?.(); clearTimeout(tipTimer);
      cv.removeEventListener('pointermove', move);
      cv.removeEventListener('pointerleave', leave);
      cv.removeEventListener('click', click);
    });
  }
}

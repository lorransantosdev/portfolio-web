import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, inject, viewChild,
} from '@angular/core';
import { I18n } from '../core/i18n';
import { MotionService } from '../core/motion.service';

@Component({
  selector: 'app-stack-pilha',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="head">
      <h3 class="title">{{ t().mycarshub.stackTitle }}</h3>
      <div class="hint mono">
        <span class="h-ptr">{{ t().mycarshub.stackHint }}</span><span class="h-touch">{{ t().mycarshub.stackHintTouch }}</span>
      </div>
    </div>
    <div #stack class="stack">
      <div class="top mono" aria-hidden="true">{{ t().mycarshub.stackTop }}</div>
      <ul class="layers">
        @for (L of t().mycarshub.layers; track L.idx; let last = $last) {
          <li class="layer" [class.last]="last">
            <span class="lidx mono" aria-hidden="true">{{ L.idx }}</span>
            <span class="lab mono">{{ L.label }}</span>
            <span class="items">
              @for (s of L.items; track s; let f = $first) {
                @if (!f) {<span class="sl" aria-hidden="true"> / </span>}<span class="sk">{{ s }}</span>
              }
            </span>
          </li>
        }
      </ul>
      <div class="bottom mono" aria-hidden="true">{{ t().mycarshub.stackBottom }}</div>
    </div>
  `,
  styles: `
    :host { display: block; margin-top: 64px; }
    .head { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; flex-wrap: wrap; }
    .title { margin: 0; font-size: 20px; font-weight: 500; }
    .hint { font-size: 12px; color: var(--muted); }
    .stack { margin-top: 18px; }
    .top { font-size: 11px; color: var(--red); padding: 0 14px 8px; }
    .bottom { font-size: 11px; color: var(--muted); padding: 8px 14px 0; }
    .layers { list-style: none; margin: 0; padding: 0; }
    .layer {
      display: grid; grid-template-columns: 64px 150px minmax(0, 1fr); gap: 18px; align-items: baseline;
      padding: 18px 14px; border-top: 1px solid rgba(0, 0, 0, .16);
      transition: background .25s, color .25s, padding .25s; cursor: default;
    }
    .layer.last { border-bottom: 1px solid rgba(0, 0, 0, .16); }
    .layer.on { background: var(--black); color: var(--cream); padding-left: 26px; }
    .layer.on .lab { color: inherit; }
    .layer.on .lidx { color: var(--red-on-dark); }
    .h-touch { display: none; }
    @media (hover: hover) {
      .layer:hover { background: var(--black); color: var(--cream); padding-left: 26px; }
      .layer:hover .lab { color: inherit; }
      .layer:hover .lidx { color: var(--red-on-dark); }
    }
    @media (hover: none) {
      .h-ptr { display: none; }
      .h-touch { display: inline; }
    }
    .lidx { font-size: 13px; color: var(--muted); }
    .lab { font-size: 12px; color: var(--muted); }
    .items { font-size: clamp(22px, 2.6vw, 34px); font-weight: 500; letter-spacing: -.02em; line-height: 1.25; }
    .sl { opacity: .3; }
    .sk { display: inline-block; white-space: nowrap; }
    @media (max-width: 760px) {
      :host { margin-top: 48px; }
      .layer { grid-template-columns: 44px minmax(0, 1fr); }
      .lab { display: none; }
      .sk { white-space: normal; overflow-wrap: anywhere; }
    }
  `,
})
export class StackPilhaComponent {
  readonly t = inject(I18n).t;
  private stack = viewChild.required<ElementRef<HTMLElement>>('stack');

  constructor() {
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (motion.reduced) return;
      const wrap = this.stack().nativeElement;
      const layers = Array.from(wrap.querySelectorAll<HTMLElement>('.layer'));
      const cleanups: (() => void)[] = [];
      const decoders: (() => void)[] = [];

      layers.forEach((L) => {
        const nodes = Array.from(L.querySelectorAll<HTMLElement>('.sk'))
          .map((s) => s.firstChild)
          .filter((n): n is Text => !!n && n.nodeType === Node.TEXT_NODE);
        const orig = nodes.map((n) => n.nodeValue || '');
        let stop: (() => void) | null = null;
        const enter = () => {
          stop?.();
          const t0 = performance.now();
          stop = motion.add((now) => {
            const p = Math.min(1, (now - t0) / 650);
            nodes.forEach((n, j) => {
              const t = orig[j], k = Math.floor(p * t.length * 1.15);
              let o = '';
              for (let i = 0; i < t.length; i++) o += t[i] === ' ' || i < k ? t[i] : Math.random() < .5 ? '0' : '1';
              n.nodeValue = o;
            });
            if (p >= 1) { nodes.forEach((n, j) => (n.nodeValue = orig[j])); return false; }
            return true;
          });
        };
        decoders.push(enter);
        if (!motion.coarse) L.addEventListener('pointerenter', enter);
        cleanups.push(() => { L.removeEventListener('pointerenter', enter); stop?.(); });
      });

      if (motion.coarse) {
        let active = -1, stopScroll: (() => void) | null = null;
        const pick = () => {
          const vh = window.innerHeight || 800, mid = vh / 2;
          let best = -1, bestD = vh * .3;
          layers.forEach((L, i) => {
            const r = L.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - mid);
            if (d < bestD) { bestD = d; best = i; }
          });
          if (best === active) return;
          if (active >= 0) layers[active].classList.remove('on');
          active = best;
          if (best >= 0) { layers[best].classList.add('on'); decoders[best](); }
        };
        const stopNear = motion.observe(wrap, (e) => {
          if (e.isIntersecting) { if (!stopScroll) stopScroll = motion.onScroll(pick); }
          else if (stopScroll) {
            stopScroll(); stopScroll = null;
            if (active >= 0) layers[active].classList.remove('on');
            active = -1;
          }
        });
        cleanups.push(() => { stopNear(); stopScroll?.(); });
      }

      const stopIO = motion.observe(
        wrap,
        (e) => {
          if (!e.isIntersecting) return;
          stopIO();
          layers.forEach((L, i) =>
            L.animate([{ opacity: 0, translate: '0 -28px' }, { opacity: 1, translate: '0 0' }], {
              duration: 520, delay: i * 90, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards',
            }),
          );
        },
        { threshold: .25 },
      );
      destroyRef.onDestroy(() => { stopIO(); cleanups.forEach((c) => c()); });
    });
  }
}

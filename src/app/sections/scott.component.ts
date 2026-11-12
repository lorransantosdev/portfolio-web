import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, inject, signal, viewChild,
} from '@angular/core';
import { I18n } from '../core/i18n';
import { MotionService } from '../core/motion.service';
import { ChapterDirective } from '../core/chapter';
import { RiseComponent } from '../core/rise.component';
import { BinaryShapeComponent } from '../binary/binary-shape.component';
import { LINKS } from '../content/shared';
import { ScottPose } from '../content/types';

const POSE: Record<ScottPose, { src: string; w: number; h: number }> = {
  idle: { src: 'assets/scott-idle.webp', w: 520, h: 481 },
  wave: { src: 'assets/scott-wave.webp', w: 520, h: 464 },
  jump: { src: 'assets/scott-jump.webp', w: 520, h: 414 },
  laptop: { src: 'assets/scott-laptop.webp', w: 520, h: 355 },
};

interface Heart { id: number; c: string; left: number; top: number; dx: number; delay: number; mono: boolean }

@Component({
  selector: 'app-scott',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChapterDirective, RiseComponent, BinaryShapeComponent],
  template: `
    <section #sec id="scott" [chapter]="t().scott.chapter" class="sec" aria-labelledby="scott-faq-t">
      <div class="autogrid grid">
        <div class="left">
          <div class="stage" (pointerenter)="hover()" (pointerleave)="unhover()">
            <div class="disc" aria-hidden="true"></div>
            @if (bubble()) { <div class="bubble" role="status">{{ bubble() }}</div> }
            @for (h of hearts(); track h.id) {
              <span class="heart" aria-hidden="true" [class.mono-h]="h.mono"
                [style.left.%]="h.left" [style.top.%]="h.top" [style.--dx]="h.dx + 'px'" [style.animation-delay.ms]="h.delay">{{ h.c }}</span>
            }
            <button type="button" class="petbtn" [attr.aria-label]="t().scott.petAria" (click)="pet()">
              <img #img class="scott" [class.zoom]="zoom()" [class.jump]="pose() === 'jump'"
                [src]="img_().src" [attr.width]="img_().w" [attr.height]="img_().h" [alt]="t().scott.alts[pose()]" decoding="async" />
            </button>
            <div class="hint mono" aria-hidden="true">{{ t().scott.clickHint }}</div>
          </div>
          <div class="floor"></div>
          <div class="nm">
            <span class="name">{{ t().scott.name }}</span>
            <app-binary shape="pata" [w]="70" [h]="70" ink="#d91d04" />
          </div>
          <div class="desc">{{ t().scott.desc }}</div>
        </div>

        <div>
          <h2 id="scott-faq-t" class="ftitle" [rise]="t().scott.faqTitleA" [em]="t().scott.faqTitleEm" [br]="true"></h2>
          <p class="flead">{{ t().scott.faqLead }}</p>
          <div class="faqs">
            @for (f of t().scott.faqs; track $index; let i = $index) {
              <div class="faq" [class.open]="open() === i">
                <h3 class="fq">
                  <button type="button" [id]="'faq-q-' + i" [attr.aria-expanded]="open() === i" [attr.aria-controls]="'faq-a-' + i" (click)="toggle(i)">
                    <span>{{ f.q }}</span><span class="sign" aria-hidden="true">+</span>
                  </button>
                </h3>
                <div class="fa" [id]="'faq-a-' + i" role="region" [attr.aria-labelledby]="'faq-q-' + i" [attr.inert]="open() === i ? null : ''">
                  <div class="fain">
                    <div class="faw"><span class="who mono">{{ t().scott.faqVoice }}</span><span class="ans">{{ f.a }}</span></div>
                  </div>
                </div>
              </div>
            }
          </div>
          <form class="form" (submit)="submit($event)">
            <label for="sq" class="mono">{{ t().scott.formLabel }}</label>
            <div class="field">
              <input id="sq" name="q" [value]="input()" (input)="input.set($any($event.target).value)"
                [placeholder]="t().scott.placeholder" autocomplete="off" />
              <button type="submit" class="send press">{{ t().scott.send }}</button>
            </div>
            <div class="note mono">{{ t().scott.formNote }}</div>
          </form>
        </div>
      </div>
    </section>
  `,
  styles: `
    :host { display: block; }
    .sec { max-width: var(--container); margin: 0 auto; padding: 100px var(--pad-x) 120px; }
    .grid { --min: 300px; --gap: 56px; margin-top: 28px; align-items: start; }
    .left { position: relative; }
    .stage { position: relative; }
    .disc { position: absolute; left: 12%; right: 12%; bottom: 4%; aspect-ratio: 1; border-radius: 50%; background: var(--red); }
    .bubble {
      position: absolute; right: 4%; top: 6%; z-index: 4; background: var(--black); color: var(--cream);
      font-size: 15px; padding: 10px 14px; border-radius: 16px 16px 4px 16px; max-width: 200px;
      transform-origin: 100% 100%; animation: say-in .22s var(--ease) both;
    }
    @keyframes say-in { from { opacity: 0; scale: .92; translate: 0 6px; } }
    .mono-h { font-family: var(--font-mono); font-size: 16px; font-weight: 600; }
    .heart { z-index: 5; }
    .petbtn { display: block; width: 100%; background: none; border: 0; padding: 0; cursor: pointer; position: relative; }
    .petbtn:focus-visible { outline-offset: -4px; }
    .fq button:active .sign { scale: .8; }
    .scott {
      position: relative; display: block; width: 78%; max-width: 380px; margin: 0 auto; height: auto;
      aspect-ratio: 520 / 481; object-fit: contain; object-position: 50% 100%;
      transform-origin: 50% 100%; transition: transform .45s cubic-bezier(.34, 1.56, .64, 1); will-change: rotate, scale;
    }
    .scott.jump { transform: translateY(-34px); }
    .hint { position: absolute; left: 0; bottom: 8px; font-size: 11px; color: var(--muted); }
    .floor { height: 1px; background: rgba(0, 0, 0, .2); margin-top: -2px; }
    .nm { display: flex; align-items: center; gap: 12px; margin-top: 14px; }
    .name { font-family: var(--font-display); font-size: 44px; letter-spacing: -.02em; }
    .desc { font-size: 15px; color: var(--body); margin-top: 4px; }

    .ftitle { margin: 0; font-family: var(--font-display); font-weight: 400; font-size: clamp(36px, 4vw, 52px); line-height: 1; letter-spacing: -.02em; }
        .flead { font-size: 16px; color: var(--body); margin: 14px 0 0; }
    .faqs { display: flex; flex-direction: column; margin-top: 22px; border-bottom: 1px solid var(--line); }
    .faq { border-top: 1px solid var(--line); }
    .fq { margin: 0; font: inherit; }
    .fq button {
      width: 100%; text-align: left; background: none; border: 0; padding: 16px 0; font: inherit; font-size: 18px;
      font-weight: 500; cursor: pointer; color: var(--black); display: flex; justify-content: space-between; gap: 16px; align-items: center;
      min-height: 44px;
    }
    @media (hover: hover) and (pointer: fine) {
      .fq button:hover { color: var(--red); }
      }
    .sign { color: var(--red); font-size: 22px; line-height: 1; transition: rotate .25s var(--ease), scale .15s var(--ease); flex: 0 0 auto; }
    .faq.open .sign { rotate: 45deg; }
    .fa { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .22s var(--ease), visibility .22s; visibility: hidden; }
    .faq.open .fa { grid-template-rows: 1fr; visibility: visible; transition-duration: .3s; }
    .fain { overflow: hidden; min-height: 0; }
    .faw {
      display: grid; grid-template-columns: 54px minmax(0, 1fr); gap: 12px; padding: 0 0 18px;
      opacity: 0; translate: 0 -6px; transition: opacity .2s var(--ease), translate .3s var(--ease);
    }
    .faq.open .faw { opacity: 1; translate: 0 0; transition-delay: .08s; }
    .who { font-size: 11px; color: var(--red); padding-top: 4px; }
    .ans { font-size: 16px; line-height: 1.6; color: var(--body-2); }

    .form { margin-top: 30px; }
    label { display: block; font-size: 12px; color: var(--muted); }
    .field { display: flex; align-items: center; gap: 12px; margin-top: 6px; border-bottom: 2px solid var(--black); padding-bottom: 8px; }
    .field:focus-within { border-bottom-color: var(--red); }
    input {
      flex: 1; min-width: 0; border: 0; background: transparent; font: inherit; font-size: 22px; padding: 10px 0;
      outline: none; color: var(--black);
    }
    input::placeholder { color: #8a817b; }
    .send {
      background: var(--black); color: var(--cream); border: 0; border-radius: var(--radius-pill); height: 44px;
      padding: 0 18px; font: inherit; font-size: 14px; cursor: pointer; white-space: nowrap;
    }
    .note { font-size: 11px; color: var(--muted); margin-top: 10px; }
    @media (max-width: 760px) { .sec { padding: 56px 20px 24px; } }
    @media (prefers-reduced-motion: reduce) {
      .scott.jump { transform: none; }
      @keyframes say-in { from { opacity: 0; } }
      .faw { translate: none; }
    }
  `,
})
export class ScottComponent {
  readonly t = inject(I18n).t;
  private motion = inject(MotionService);

  readonly pose = signal<ScottPose>('idle');
  readonly img_ = computed(() => POSE[this.pose()]);
  readonly bubble = signal('');
  readonly hearts = signal<Heart[]>([]);
  readonly zoom = signal(false);
  readonly open = signal(0);
  readonly input = signal('');

  private sec = viewChild.required<ElementRef<HTMLElement>>('sec');
  private img = viewChild.required<ElementRef<HTMLImageElement>>('img');
  private lean = 0;
  private wagUntil = 0;
  private pets: number[] = [];
  private hk = 0;
  private timers: Record<string, ReturnType<typeof setTimeout>> = {};

  private later(key: string, ms: number, fn: () => void): void {
    clearTimeout(this.timers[key]);
    this.timers[key] = setTimeout(fn, ms);
  }

  say(text: string, ms = 2200): void {
    this.bubble.set(text);
    this.later('bubble', ms, () => this.bubble.set(''));
  }

  private bounce(ms: number): void {
    this.pose.set('jump');
    this.later('pose', ms, () => this.pose.set('idle'));
  }

  hover(): void {
    if (this.pose() === 'idle') this.pose.set('wave');
    this.say(this.t().scott.hoverSay, 1600);
  }

  unhover(): void {
    this.lean = 0;
    if (this.pose() === 'wave') this.pose.set('idle');
  }

  pet(): void {
    this.motion.haptic();
    const now = Date.now();
    this.pets = this.pets.filter((x) => now - x < 2500);
    this.pets.push(now);
    const id = ++this.hk;
    const hs: Heart[] = [];
    for (let i = 0; i < 4; i++) {
      hs.push({
        id: id * 10 + i, c: i === 0 ? 'au!' : '♥', mono: i === 0,
        left: 35 + Math.round(Math.random() * 30), top: 25 + Math.round(Math.random() * 25),
        dx: Math.round((Math.random() - .5) * 80), delay: i * 90,
      });
    }
    this.hearts.update((h) => [...h, ...hs].slice(-16));
    this.later('hearts', 1300, () => this.hearts.set([]));
    this.bounce(900);
    if (this.pets.length >= 5 && !this.motion.reduced) {
      this.pets = [];
      this.zoom.set(true);
      this.say(this.t().scott.zoomies, 1500);
      this.later('zoom', 1250, () => this.zoom.set(false));
    } else {
      const s = this.t().scott.petSays;
      this.say(s[Math.floor(Math.random() * s.length)], 1400);
    }
  }

  private greet(): void {
    if (this.pose() !== 'idle') return;
    this.pose.set('wave');
    this.say(this.t().scott.hoverSay, 1600);
    this.later('pose', 1100, () => this.bounce(800));
  }

  toggle(i: number): void {
    const o = this.open() === i ? -1 : i;
    this.open.set(o);
    if (o >= 0) {
      this.motion.haptic(8);
      this.bounce(900);
      this.wagUntil = performance.now() + 1100;
    }
  }

  submit(e: Event): void {
    e.preventDefault();
    const q = this.input().trim();
    if (!q) return;
    const href =
      `${LINKS.mailto}?subject=${encodeURIComponent(this.t().scott.mailSubject)}&body=${encodeURIComponent(q)}`;
    window.location.href = href;
    this.input.set('');
    this.say(this.t().scott.sendSay, 1800);
    this.bounce(1200);
  }

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => Object.values(this.timers).forEach(clearTimeout));
    afterNextRender(() => {
      Object.values(POSE).forEach((p) => { const im = new Image(); im.decoding = 'async'; im.src = p.src; });
      const sec = this.sec().nativeElement;
      const calm = this.motion.reduced;
      const img = this.img().nativeElement;
      const move = (e: PointerEvent) => {
        const r = sec.getBoundingClientRect();
        this.lean = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width * .25)) / (r.width * .5)));
      };
      const leave = () => (this.lean = 0);
      sec.addEventListener('pointermove', move);
      sec.addEventListener('pointerleave', leave);
      const tick = (now: number) => {
        if (this.zoom()) return;
        const t = now / 1000;
        const wag = calm ? 0 : now < this.wagUntil ? Math.sin(t * 22) * 5 : Math.floor(t) % 7 === 0 ? Math.sin(t * 18) * 3 : 0;
        img.style.rotate = ((calm ? 0 : this.lean * 7) + wag).toFixed(2) + 'deg';
        const b = Math.sin(t * 2.4) * .012;
        img.style.scale = (1 + b).toFixed(4) + ' ' + (1 - b).toFixed(4);
      };
      let stopTick: (() => void) | null = null;
      const stopIO = this.motion.observe(sec, (e) => {
        if (e.isIntersecting) { if (!stopTick) stopTick = this.motion.add(tick); }
        else if (stopTick) { stopTick(); stopTick = null; }
      });
      const stopGreet = this.motion.coarse
        ? this.motion.observe(
            img,
            (e) => {
              if (!e.isIntersecting) return;
              stopGreet();
              this.greet();
            },
            { threshold: .6 },
          )
        : () => {};
      destroyRef.onDestroy(() => {
        stopIO(); stopTick?.(); stopGreet();
        sec.removeEventListener('pointermove', move);
        sec.removeEventListener('pointerleave', leave);
      });
    });
  }
}

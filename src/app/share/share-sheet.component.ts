import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, effect, inject, signal, untracked, viewChild,
} from '@angular/core';
import { I18n } from '../core/i18n';
import { MotionService } from '../core/motion.service';
import { SITE_URL } from '../content/shared';
import { ShareService } from './share.service';
import { QR_ROWS } from './share-data';
import { drawQr, renderStory } from './story-card';

interface Module { r: number; c: number; red: boolean; sx: number; sy: number; d: string; delay: number; }

@Component({
  selector: 'app-share-sheet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dialog #dlg class="sheet" [class.closing]="closing()" (close)="onNativeClose()" (click)="backdrop($event)"
            [attr.aria-labelledby]="'share-title'">
      <div class="card">
        <button type="button" class="x tap" (click)="close()" [attr.aria-label]="s().close">×</button>
        <div class="qrpanel">
          <canvas #qr class="qr" role="img" [attr.aria-label]="s().qrAria" (click)="replay()"></canvas>
          <span class="hint mono">{{ s().qrHint }}</span>
        </div>
        <div class="body">
          <span class="kicker mono">{{ s().kicker }}</span>
          <h2 id="share-title" class="title">{{ s().titlePre }} <em>{{ s().titleEm }}</em></h2>

          <div class="field">
            <span class="url mono">{{ shortUrl() }}</span>
            <button type="button" class="copy tap" [class.done]="copied()" (click)="copy()">
              {{ copied() ? s().copied : s().copy }}
            </button>
          </div>

          <span class="via mono">{{ s().via }}</span>
          <div class="nets">
            @for (n of nets(); track n.label) {
              <a class="net tap" [href]="n.href" target="_blank" rel="noopener">{{ n.label }}</a>
            }
          </div>

          <div class="more">
            @if (canNative) {
              <button type="button" class="ghost tap" (click)="native()">{{ s().native }}</button>
            }
            <button type="button" class="ghost tap" [disabled]="busy()" (click)="story()">
              {{ busy() ? s().storyBusy : s().story }}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  `,
  styles: `
    :host { display: contents; }
    .sheet {
      border: 0; padding: 0; margin: auto; background: transparent; color: var(--cream);
      max-width: min(920px, calc(100vw - 32px)); width: 100%; overflow: visible;
    }
    .sheet::backdrop { background: rgba(0, 0, 0, .55); -webkit-backdrop-filter: blur(4px); backdrop-filter: blur(4px); }
    .sheet[open] { animation: card-in var(--duration-slow) var(--ease-smooth-out) both; }
    .sheet[open]::backdrop { animation: fade-in var(--duration-medium) var(--ease-out) both; }
    .sheet.closing { animation: card-out var(--duration-fast) var(--ease-in-out) both; }
    .sheet.closing::backdrop { animation: fade-out var(--duration-fast) var(--ease-in-out) both; }
    @keyframes card-in { from { opacity: 0; transform: translateY(var(--distance-medium)) scale(var(--scale-large)); } }
    @keyframes card-out { to { opacity: 0; transform: translateY(var(--distance-base)) scale(var(--scale-small)); } }
    @keyframes fade-in { from { opacity: 0; } }
    @keyframes fade-out { to { opacity: 0; } }

    .card {
      position: relative; display: grid; grid-template-columns: 360px minmax(0, 1fr);
      background: var(--black); border-radius: var(--radius-card-xl); overflow: hidden;
      box-shadow: 0 40px 90px -30px rgba(0, 0, 0, .6);
    }
    .x {
      position: absolute; top: 14px; right: 14px; z-index: 2; width: 40px; height: 40px; border-radius: 50%;
      border: 1px solid var(--line-dark); background: transparent; color: var(--cream); font-size: 22px; line-height: 1;
      cursor: pointer;
    }
    .qrpanel {
      background: var(--red); display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 16px; padding: 40px 24px;
    }
    .qr {
      width: 284px; height: 284px; display: block; background: var(--cream); border-radius: 22px;
      padding: 18px; box-sizing: content-box; cursor: pointer; max-width: 100%;
    }
    .hint { font-size: 11px; color: rgba(249, 242, 234, .85); }
    .body { padding: 44px 44px 40px; display: flex; flex-direction: column; min-width: 0; }
    .kicker { font-size: 12px; color: #ff8a73; }
    .title {
      font-family: var(--font-display); font-weight: 400; font-size: clamp(40px, 5vw, 58px); line-height: .95;
      letter-spacing: -.02em; margin: 12px 0 28px;
    }
    .title em { color: var(--red-on-dark); }
    .field {
      display: flex; align-items: center; gap: 8px; padding: 6px 6px 6px 18px;
      border: 1px solid var(--line-dark); border-radius: var(--radius-pill);
    }
    .url { flex: 1; min-width: 0; font-size: 15px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .copy {
      flex: none; height: 42px; padding: 0 18px; border: 0; border-radius: var(--radius-pill); cursor: pointer;
      background: var(--cream); color: var(--black); font: 500 14px var(--font-body);
      transition: background var(--duration-fast) var(--ease-out), color var(--duration-fast) var(--ease-out);
    }
    .copy.done { background: var(--red); color: var(--cream); }
    .via { font-size: 11px; color: var(--muted-dark); margin: 26px 0 10px; }
    .nets { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
    .net {
      height: 44px; display: flex; align-items: center; justify-content: center; text-decoration: none;
      border: 1px solid var(--line-dark); border-radius: var(--radius-card-sm); font-size: 14px; color: var(--cream);
      transition: border-color var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out);
    }
    .more { display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto; padding-top: 26px; }
    .ghost {
      height: 44px; padding: 0 16px; border-radius: var(--radius-pill); cursor: pointer;
      border: 1px solid var(--line-dark); background: transparent; color: var(--cream); font: 500 14px var(--font-body);
    }
    .ghost:disabled { opacity: .6; cursor: progress; }
    @media (hover: hover) and (pointer: fine) {
      .net:hover, .ghost:hover:not(:disabled) { border-color: var(--cream); }
      .x:hover { border-color: var(--cream); }
    }

    @media (max-width: 760px) {
      .sheet { max-width: 100vw; margin: auto 0 0; }
      .sheet[open] { animation-name: sheet-in; }
      .sheet.closing { animation-name: sheet-out; }
      @keyframes sheet-in { from { transform: translateY(100%); } }
      @keyframes sheet-out { to { transform: translateY(100%); } }
      .card { grid-template-columns: 1fr; border-radius: var(--radius-card-xl) var(--radius-card-xl) 0 0; }
      .qrpanel { padding: 28px 20px 20px; gap: 10px; }
      .qr { width: 190px; height: 190px; padding: 12px; border-radius: 18px; }
      .body { padding: 24px 20px calc(24px + env(safe-area-inset-bottom)); }
      .title { margin: 8px 0 20px; }
      .nets { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .more { padding-top: 18px; }
      .more .ghost { flex: 1; }
    }
    @media (prefers-reduced-motion: reduce) {
      .sheet[open], .sheet.closing { animation-name: fade-in; }
      .sheet.closing { animation-name: fade-out; }
    }
  `,
})
export class ShareSheetComponent {
  private share = inject(ShareService);
  private motion = inject(MotionService);
  private t = inject(I18n).t;
  readonly s = computed(() => this.t().share);

  private dlg = viewChild<ElementRef<HTMLDialogElement>>('dlg');
  private qr = viewChild.required<ElementRef<HTMLCanvasElement>>('qr');

  readonly closing = signal(false);
  readonly copied = signal(false);
  readonly busy = signal(false);
  readonly canNative = this.motion.isBrowser && typeof navigator.share === 'function';

  readonly url = computed(() => SITE_URL + (this.t().lang === 'en' ? '/en' : ''));
  readonly shortUrl = computed(() => this.url().replace(/^https?:\/\//, ''));
  readonly nets = computed(() => {
    const u = encodeURIComponent(this.url());
    const msg = encodeURIComponent(this.s().message);
    return [
      { label: 'WhatsApp', href: `https://wa.me/?text=${msg}%20${u}` },
      { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
      { label: 'X', href: `https://x.com/intent/post?text=${msg}&url=${u}` },
      { label: 'E-mail', href: `mailto:?subject=${encodeURIComponent(this.s().subject)}&body=${msg}%20${u}` },
    ];
  });

  private mods: Module[] = [];
  private t0 = 0;
  private stop: () => void = () => {};
  private logo: HTMLImageElement | null = null;
  private copyTimer = 0;

  constructor() {
    effect(() => {
      const open = this.share.open();
      untracked(() => (open ? this.show() : this.close()));
    });
    inject(DestroyRef).onDestroy(() => { this.stop(); clearTimeout(this.copyTimer); });
  }

  private show(): void {
    const d = this.dlg()?.nativeElement;
    if (!d || d.open) return;
    this.closing.set(false);
    d.showModal();
    this.motion.haptic();
    this.setupQr();
  }

  close(): void {
    const d = this.dlg()?.nativeElement;
    if (!d?.open || this.closing()) return;
    this.closing.set(true);
    setTimeout(() => d.close(), this.motion.ms('--duration-fast', 250));
  }

  onNativeClose(): void {
    this.closing.set(false);
    this.stop();
    this.share.open.set(false);
  }

  backdrop(e: MouseEvent): void {
    if (e.target === this.dlg()?.nativeElement) this.close();
  }

  // QR: cada módulo chega como 0/1 voando e trava como quadrado
  private setupQr(): void {
    const cv = this.qr().nativeElement;
    const size = cv.clientWidth || 284, dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = size * dpr; cv.height = size * dpr;
    const g = cv.getContext('2d')!;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!this.logo) {
      const img = new Image();
      img.onload = () => { this.logo = img; };
      img.src = '/logo.svg';
    }
    if (this.motion.reduced) {
      g.clearRect(0, 0, size, size);
      const paint = () => { g.clearRect(0, 0, size, size); drawQr(g, 0, 0, size, this.logo); };
      paint();
      if (!this.logo) setTimeout(paint, 300);
      return;
    }
    this.seed(size);
    this.stop();
    this.stop = this.motion.add((now) => { this.frame(g, size, now); });
  }

  private seed(size: number): void {
    const n = QR_ROWS.length, mid = (n - 1) / 2;
    const finder = (r: number, c: number) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7);
    this.mods = [];
    QR_ROWS.forEach((row, r) => {
      for (let c = 0; c < n; c++) {
        if (row[c] !== '1' || (Math.abs(r - mid) <= 4 && Math.abs(c - mid) <= 4)) continue;
        const a = Math.random() * Math.PI * 2, dist = size * (.35 + Math.random() * .5);
        this.mods.push({
          r, c, red: finder(r, c), d: Math.random() < .5 ? '0' : '1',
          sx: Math.cos(a) * dist, sy: Math.sin(a) * dist,
          delay: Math.hypot(r - mid, c - mid) / n * .5 + Math.random() * .25,
        });
      }
    });
    this.t0 = performance.now();
  }

  replay(): void {
    if (this.motion.reduced) return;
    this.seed(this.qr().nativeElement.clientWidth || 284);
  }

  private frame(g: CanvasRenderingContext2D, size: number, now: number): void {
    const n = QR_ROWS.length, cell = size / n, t = (now - this.t0) / 1000;
    g.clearRect(0, 0, size, size);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `700 ${(cell * 1.25).toFixed(1)}px 'Geist Mono Variable', monospace`;
    for (const m of this.mods) {
      const p = Math.min(1, Math.max(0, (t - m.delay) / .7));
      if (p <= 0) continue;
      const e = 1 - Math.pow(1 - p, 3);
      const x = m.c * cell + m.sx * (1 - e), y = m.r * cell + m.sy * (1 - e);
      g.fillStyle = m.red ? '#d91d04' : '#000';
      if (p < .8) {
        g.globalAlpha = .3 + p * .7;
        g.fillText(m.d, x + cell / 2, y + cell / 2);
      } else {
        const k = (p - .8) / .2;
        g.globalAlpha = 1;
        const w = cell * (.5 + .5 * k) + .5;
        g.fillRect(x + (cell - w) / 2, y + (cell - w) / 2, w, w);
      }
    }
    g.globalAlpha = 1;
    const lt = Math.min(1, Math.max(0, (t - 1.1) / .5));
    if (lt > 0 && this.logo) {
      const l = cell * 7.4, eb = 1 - Math.pow(1 - lt, 3);
      g.save();
      g.translate(size / 2, size / 2);
      g.rotate((1 - eb) * -Math.PI);
      g.scale(.4 + .6 * eb, .4 + .6 * eb);
      g.globalAlpha = lt;
      g.drawImage(this.logo, -l / 2, -l / 2, l, l);
      g.restore();
    }
    // linha de leitura passando de tempos em tempos
    const st = (t - 2) % 4.5;
    if (t > 2 && st < 1.1) {
      const y = (st / 1.1) * size;
      const grad = g.createLinearGradient(0, y - 14, 0, y + 2);
      grad.addColorStop(0, 'rgba(217,29,4,0)');
      grad.addColorStop(1, 'rgba(217,29,4,.45)');
      g.fillStyle = grad;
      g.fillRect(0, y - 14, size, 16);
    }
  }

  async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.url());
    } catch {
      const ta = document.createElement('textarea');
      ta.value = this.url();
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      (this.dlg()?.nativeElement ?? document.body).appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* sem clipboard */ }
      ta.remove();
    }
    this.copied.set(true);
    this.motion.haptic(15);
    clearTimeout(this.copyTimer);
    this.copyTimer = window.setTimeout(() => this.copied.set(false), 1800);
  }

  async native(): Promise<void> {
    try {
      await navigator.share({ title: 'lorran', text: this.s().message, url: this.url() });
    } catch { /* usuário cancelou */ }
  }

  async story(): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      const s = this.s();
      const cv = await renderStory({
        kicker: s.storyKicker, line1: s.storyLine1, line2: s.storyLine2, em: s.storyEm,
        cta: s.storyCta, url: this.shortUrl().replace(/\/en$/, ''), tag: s.storyTag,
      });
      const blob = await new Promise<Blob | null>((res) => cv.toBlob(res, 'image/png'));
      if (!blob) return;
      const file = new File([blob], 'lorran-stories.png', { type: 'image/png' });
      if (this.motion.coarse && navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file] }); return; } catch { /* cai pro download */ }
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } finally {
      this.busy.set(false);
    }
  }
}

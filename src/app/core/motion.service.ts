import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Ticker = (now: number, sub: number) => boolean | void;

@Injectable({ providedIn: 'root' })
export class MotionService {
  readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  readonly reduced: boolean =
    this.isBrowser && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  readonly coarse: boolean =
    this.isBrowser && !!window.matchMedia && window.matchMedia('(hover: none)').matches;
  readonly timeline: boolean =
    this.isBrowser && typeof CSS !== 'undefined' && !!CSS.supports && CSS.supports('animation-timeline: view()');

  constructor() {
    // o iOS só aplica :active se a página tiver algum listener de touch
    if (this.coarse) document.addEventListener('touchstart', () => {}, { passive: true });
  }

  ms(name: string, fallback: number): number {
    if (!this.isBrowser) return fallback;
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
    return Number.isNaN(v) ? fallback : v;
  }

  haptic(ms = 10): void {
    if (this.coarse && typeof navigator.vibrate === 'function') navigator.vibrate(ms);
  }

  private tickers = new Set<Ticker>();
  private raf = 0;
  private last = 0;

  scrollDelta = 0;
  private lastScrollY = 0;
  private scrollSubs = new Set<() => void>();
  private scrollPending = false;
  private scrollBound = false;

  add(fn: Ticker): () => void {
    if (!this.isBrowser) return () => {};
    this.tickers.add(fn);
    this.start();
    return () => this.tickers.delete(fn);
  }

  private start(): void {
    if (this.raf) return;
    this.last = performance.now() - 16.7;
    this.raf = requestAnimationFrame(this.frame);
  }

  private frame = (now: number): void => {
    const sub = Math.min(4, Math.max(1, Math.round((now - this.last) / 16.7)));
    this.last = now;
    if (this.scrollPending) {
      this.scrollPending = false;
      const y = window.scrollY || 0;
      this.scrollDelta = y - this.lastScrollY;
      this.lastScrollY = y;
      this.scrollSubs.forEach((fn) => fn());
    }
    for (const fn of Array.from(this.tickers)) {
      let keep: boolean | void = true;
      try {
        keep = fn(now, sub);
      } catch (e) {
        console.error(e);
        keep = false;
      }
      if (keep === false) this.tickers.delete(fn);
    }
    this.raf = this.tickers.size || this.scrollPending ? requestAnimationFrame(this.frame) : 0;
  };

  onScroll(fn: () => void): () => void {
    if (!this.isBrowser) return () => {};
    this.scrollSubs.add(fn);
    if (!this.scrollBound) {
      this.scrollBound = true;
      this.lastScrollY = window.scrollY || 0;
      const kick = () => {
        this.scrollPending = true;
        this.start();
      };
      window.addEventListener('scroll', kick, { passive: true });
      window.addEventListener('resize', kick, { passive: true });
    }
    fn();
    return () => this.scrollSubs.delete(fn);
  }

  observe(
    el: Element,
    cb: (entry: IntersectionObserverEntry) => void,
    opts?: IntersectionObserverInit,
  ): () => void {
    if (!this.isBrowser || typeof IntersectionObserver === 'undefined') return () => {};
    const io = new IntersectionObserver((es) => es.forEach(cb), opts);
    io.observe(el);
    return () => io.disconnect();
  }
}

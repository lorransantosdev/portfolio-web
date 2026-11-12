import { Injectable, inject } from '@angular/core';
import { MotionService } from './motion.service';

const COUNT = 8;
const RADIUS = 22;
const SIZE = 9;
const LIFE = 420;
const REACH = RADIUS + SIZE + 4;

@Injectable({ providedIn: 'root' })
export class SparkService {
  private motion = inject(MotionService);
  private started = false;

  start(): () => void {
    if (this.started || !this.motion.isBrowser || this.motion.reduced) return () => {};
    this.started = true;
    const color = getComputedStyle(document.documentElement).getPropertyValue('--red').trim() || '#d91d04';
    const down = (e: PointerEvent) => {
      if (e.button !== 0 || !(e.target instanceof Element)) return;
      if (!e.target.closest('a, button, .gh')) return;
      this.burst(e.clientX, e.clientY, color);
    };
    document.addEventListener('pointerdown', down, { passive: true });
    return () => {
      document.removeEventListener('pointerdown', down);
      this.started = false;
    };
  }

  private burst(x: number, y: number, color: string): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cv = document.createElement('canvas');
    const side = REACH * 2;
    cv.width = cv.height = Math.ceil(side * dpr);
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText =
      `position:fixed;left:${x - REACH}px;top:${y - REACH}px;width:${side}px;height:${side}px;pointer-events:none;z-index:60`;
    document.body.appendChild(cv);
    const g = cv.getContext('2d');
    if (!g) return cv.remove();
    g.scale(dpr, dpr);
    g.strokeStyle = color;
    g.lineCap = 'round';
    g.lineWidth = 2;
    const turn = Math.random() * Math.PI;
    const t0 = performance.now();
    this.motion.add((now) => {
      const p = Math.min(1, (now - t0) / LIFE);
      const e = 1 - Math.pow(1 - p, 3);
      g.clearRect(0, 0, side, side);
      g.globalAlpha = 1 - p * p;
      g.beginPath();
      for (let i = 0; i < COUNT; i++) {
        const a = turn + (i / COUNT) * Math.PI * 2;
        const d = 4 + RADIUS * e;
        const len = SIZE * (1 - e);
        g.moveTo(REACH + Math.cos(a) * d, REACH + Math.sin(a) * d);
        g.lineTo(REACH + Math.cos(a) * (d + len), REACH + Math.sin(a) * (d + len));
      }
      g.stroke();
      if (p >= 1) cv.remove();
      return p < 1;
    });
  }
}

import { Directive, ElementRef, Injectable, afterNextRender, inject, input, signal, DestroyRef } from '@angular/core';
import { MotionService } from './motion.service';

@Injectable({ providedIn: 'root' })
export class ChapterService {
  readonly chapter = signal('');
  readonly miniSay = signal('');
  private said = new Set<string>();
  private timer: ReturnType<typeof setTimeout> | undefined;

  say(text: string): void {
    if (!text || this.said.has(text)) return;
    this.said.add(text);
    clearTimeout(this.timer);
    this.miniSay.set(text);
    this.timer = setTimeout(() => this.miniSay.set(''), 3200);
  }
}

@Directive({ selector: '[chapter]', host: { '[attr.data-ch]': 'chapter()' } })
export class ChapterDirective {
  readonly chapter = input.required<string>();
  readonly say = input('');

  constructor() {
    const el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    const motion = inject(MotionService);
    const svc = inject(ChapterService);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const a = motion.observe(el, (e) => e.isIntersecting && svc.chapter.set(this.chapter()), {
        rootMargin: '-45% 0px -50% 0px',
      });
      const b = this.say()
        ? motion.observe(
            el,
            (e) =>
              e.isIntersecting &&
              (e.intersectionRatio >= 0.35 || e.intersectionRect.height >= window.innerHeight * 0.35) &&
              svc.say(this.say()),
            { threshold: [0, 0.1, 0.2, 0.35, 0.5] },
          )
        : () => {};
      destroyRef.onDestroy(() => {
        a();
        b();
      });
    });
  }
}

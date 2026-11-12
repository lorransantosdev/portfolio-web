import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, Injector, afterNextRender, effect, inject, input, signal, untracked,
} from '@angular/core';

@Component({
  selector: '[swap]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'swap' },
  template: `{{ shown() }}`,
  styles: `
    :host {
      display: inline-block;
      transition:
        translate var(--text-swap-dur) var(--text-swap-ease),
        filter var(--text-swap-dur) var(--text-swap-ease),
        opacity var(--text-swap-dur) var(--text-swap-ease);
    }
    :host(.is-exit) { translate: 0 calc(var(--text-swap-translate-y) * -1); filter: blur(var(--text-swap-blur)); opacity: 0; }
    :host(.is-enter) { translate: 0 var(--text-swap-translate-y); filter: blur(var(--text-swap-blur)); opacity: 0; transition: none; }
    @media (prefers-reduced-motion: reduce) {
      :host(.is-exit), :host(.is-enter) { translate: none; filter: none; }
    }
  `,
})
export class SwapComponent {
  readonly swap = input.required<string>();
  readonly shown = signal('');

  constructor() {
    const el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    const injector = inject(Injector);
    let ready = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    inject(DestroyRef).onDestroy(() => clearTimeout(timer));
    afterNextRender(() => (ready = true));

    effect(() => {
      const next = this.swap();
      const cur = untracked(this.shown);
      if (next === cur) return;
      if (!ready || !cur) {
        this.shown.set(next);
        return;
      }
      clearTimeout(timer);
      el.classList.remove('is-enter');
      el.classList.add('is-exit');
      const dur = parseFloat(getComputedStyle(el).transitionDuration) * 1000 || 150;
      timer = setTimeout(() => {
        this.shown.set(next);
        el.classList.remove('is-exit');
        el.classList.add('is-enter');
        afterNextRender(
          () => {
            void el.offsetHeight;
            el.classList.remove('is-enter');
          },
          { injector },
        );
      }, dur);
    });
  }
}

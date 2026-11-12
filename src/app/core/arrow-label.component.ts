import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: '[arrowLabel]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `{{ text() }}@if (arrow()) {<svg class="lm" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12L12 4" /><path class="lm-t" d="M6 4H12" /><path class="lm-b" d="M12 4V10" /></svg>}`,
})
export class ArrowLabelComponent {
  readonly arrowLabel = input.required<string>();
  readonly arrow = computed(() => this.arrowLabel().endsWith('↗'));
  readonly text = computed(() => (this.arrow() ? this.arrowLabel().slice(0, -1).trimEnd() : this.arrowLabel()));
}

@Component({
  selector: 'app-arrow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<svg class="lm" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12L12 4" /><path class="lm-t" d="M6 4H12" /><path class="lm-b" d="M12 4V10" /></svg>`,
  styles: `:host { display: inline-flex; }`,
})
export class ArrowComponent {}

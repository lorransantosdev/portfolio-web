import { Injectable, computed, signal } from '@angular/core';
import { Content, Lang } from '../content/types';
import { PT } from '../content/pt';
import { EN } from '../content/en';

@Injectable({ providedIn: 'root' })
export class I18n {
  readonly lang = signal<Lang>('pt');
  readonly t = computed<Content>(() => (this.lang() === 'en' ? EN : PT));
}

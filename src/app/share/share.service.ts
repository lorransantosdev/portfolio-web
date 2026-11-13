import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ShareService {
  readonly open = signal(false);
}

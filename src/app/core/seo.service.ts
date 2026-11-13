import { Injectable, inject, DOCUMENT } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Content } from '../content/types';
import { SITE_URL } from '../content/shared';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private doc = inject(DOCUMENT);
  private title = inject(Title);
  private meta = inject(Meta);

  apply(c: Content): void {
    const url = SITE_URL + (c.path === '/' ? '/' : c.path);
    const image = SITE_URL + '/assets/og-image.jpg';
    this.doc.documentElement.lang = c.htmlLang;
    this.title.setTitle(c.meta.title);

    const tags: Record<string, string>[] = [
      { name: 'description', content: c.meta.description },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'lorran' },
      { property: 'og:title', content: c.meta.title },
      { property: 'og:description', content: c.meta.description },
      { property: 'og:url', content: url },
      { property: 'og:image', content: image },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: c.meta.ogImageAlt },
      { property: 'og:locale', content: c.meta.ogLocale },
      { property: 'og:locale:alternate', content: c.lang === 'pt' ? 'en_US' : 'pt_BR' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@lorrandev' },
      { name: 'twitter:title', content: c.meta.title },
      { name: 'twitter:description', content: c.meta.description },
      { name: 'twitter:image', content: image },
    ];
    for (const t of tags) {
      const sel = t['name'] ? `name="${t['name']}"` : `property="${t['property']}"`;
      this.meta.updateTag(t, sel);
    }

    this.link('canonical', url);
    this.link('alternate', SITE_URL + '/', 'pt-BR');
    this.link('alternate', SITE_URL + '/en', 'en');
    this.link('alternate', SITE_URL + '/', 'x-default');
  }

  private link(rel: string, href: string, hreflang?: string): void {
    const head = this.doc.head;
    const sel = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`;
    let el = head.querySelector<HTMLLinkElement>(sel);
    if (!el) {
      el = this.doc.createElement('link');
      el.setAttribute('rel', rel);
      if (hreflang) el.setAttribute('hreflang', hreflang);
      head.appendChild(el);
    }
    el.setAttribute('href', href);
  }
}

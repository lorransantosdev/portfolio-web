import { Injectable, inject, DOCUMENT } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Content } from '../content/types';
import { LINKS, SITE_URL } from '../content/shared';

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

    this.meta.updateTag({ name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1' }, 'name="robots"');
    this.meta.updateTag({ name: 'author', content: 'Lorran Sarmento' }, 'name="author"');

    this.link('canonical', url);
    this.link('alternate', SITE_URL + '/', 'pt-BR');
    this.link('alternate', SITE_URL + '/en', 'en');
    this.link('alternate', SITE_URL + '/', 'x-default');
    this.jsonLd(c, url, image);
  }

  // dados estruturados pro Google e pros assistentes de IA entenderem quem é quem
  private jsonLd(c: Content, url: string, image: string): void {
    const pt = c.lang === 'pt';
    const person = {
      '@type': 'Person',
      '@id': SITE_URL + '/#lorran',
      name: 'Lorran Sarmento',
      alternateName: ['Lorran dos Santos', 'lorrandev'],
      url: SITE_URL + '/',
      image: SITE_URL + '/assets/avatar.webp',
      email: 'mailto:' + LINKS.email,
      jobTitle: pt ? 'Engenheiro de Software Jr' : 'Software Engineer Jr',
      worksFor: { '@type': 'Organization', name: 'Cielo', url: 'https://www.cielo.com.br' },
      alumniOf: { '@type': 'CollegeOrUniversity', name: 'FIAP', url: 'https://www.fiap.com.br' },
      address: { '@type': 'PostalAddress', addressLocality: 'São Paulo', addressRegion: 'SP', addressCountry: 'BR' },
      knowsAbout: [
        'Java', 'Spring Boot', 'Angular', 'React', 'TypeScript', 'PostgreSQL', 'AWS', 'Kubernetes', 'Docker',
        'Event-driven architecture', 'System Design', 'Design Patterns', 'Payments', 'SaaS',
      ],
      knowsLanguage: ['pt-BR', 'en'],
      sameAs: [LINKS.linkedin, LINKS.github, LINKS.youtube, LINKS.instagram, LINKS.tiktok, LINKS.x],
    };
    const data = {
      '@context': 'https://schema.org',
      '@graph': [
        person,
        {
          '@type': 'WebSite',
          '@id': SITE_URL + '/#site',
          url: SITE_URL + '/',
          name: 'lorran',
          inLanguage: ['pt-BR', 'en'],
          author: { '@id': SITE_URL + '/#lorran' },
        },
        {
          '@type': 'ProfilePage',
          '@id': url + '#page',
          url,
          name: c.meta.title,
          description: c.meta.description,
          inLanguage: c.htmlLang,
          primaryImageOfPage: image,
          isPartOf: { '@id': SITE_URL + '/#site' },
          mainEntity: { '@id': SITE_URL + '/#lorran' },
        },
        {
          '@type': 'SoftwareApplication',
          name: 'MyCarsHub',
          url: LINKS.mycarshub,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          creator: { '@id': SITE_URL + '/#lorran' },
        },
      ],
    };
    let el = this.doc.head.querySelector<HTMLScriptElement>('script#ld');
    if (!el) {
      el = this.doc.createElement('script');
      el.id = 'ld';
      el.type = 'application/ld+json';
      this.doc.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
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

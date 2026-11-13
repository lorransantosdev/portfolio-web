export type Lang = 'pt' | 'en';

export interface IntroToken {
  t: string;
  k?: 'em' | 'pill' | 'avatar';
  tight?: boolean;
}

export interface Link {
  label: string;
  href: string;
}

export interface FlowNode {
  i: string;
  t: string;
  d: string;
  s: string[];
}

export interface ContractLine {
  label: string;
  v: string;
  ph: string;
}

export interface StackGroup {
  t: string;
  items: [string, 0 | 1][];
}

export interface StackLayer {
  idx: string;
  label: string;
  items: string[];
}

export interface Faq {
  q: string;
  a: string;
}

export interface ContactRow {
  k: string;
  v: string;
  href: string;
  big?: boolean;
}

export type ScottPose = 'idle' | 'wave' | 'jump' | 'laptop';

export interface Content {
  lang: Lang;
  htmlLang: string;
  locale: string;
  path: string;
  meta: {
    title: string;
    description: string;
    ogLocale: string;
    ogImageAlt: string;
  };
  nav: {
    links: Link[];
    switchLabel: string;
    switchTitle: string;
    switchHref: string;
    resume: string;
    resumeHref: string;
    homeAria: string;
    progressAria: string;
  };
  hero: {
    kicker: string;
    titlePre: string;
    titleEm: string;
    titlePost: string;
    lead: string;
    ctaStory: string;
    ctaScott: string;
    portraitAria: string;
    facts: { k: string; v: string }[];
    hint: string;
    hintTouch: string;
  };
  intro: { chapter: string; say: string; avatarAlt: string; words: IntroToken[] };
  origem: {
    chapter: string;
    title: string;
    cheeseTitle: string;
    cheeseText: string;
    shopTitle: string;
    shopStat: string;
    shopText: string;
    next: string;
  };
  fiap: {
    chapter: string;
    counterLabel: string;
    text: string;
    rows: { label: string; href?: string; result: string }[];
    postLabel: string;
    photos: { src: string; alt: string; caption: string }[];
    next: string;
  };
  cielo: {
    chapter: string;
    say: string;
    lead: string;
    roleCurrent: { title: string; dates: string };
    rolePrev: { title: string; note: string; dates: string };
    linkedin: Link;
    doLabel: string;
    does: string[];
    doAi: string;
    cardCaption: string;
    flowTitle: string;
    flowNote: string;
    flow: FlowNode[];
    questionsLead: string;
    questions: { q: string; a: string }[];
    next: string;
  };
  mycarshub: {
    chapter: string;
    say: string;
    lead: string;
    story: { a: string; b: string; c: string; d: string };
    aiTitle: { a: string; b: string; em: string; c: string };
    steps: { n: string; t: string; d: string }[];
    contractTitle: string;
    badges: [string, string, string];
    lines: ContractLine[];
    sample: string;
    dashLabel: string;
    dashAlt: string;
    phoneAlt: string;
    badgeTitle: string;
    badgeSub: string;
    builtTitle: string;
    built: StackGroup[];
    stackTitle: string;
    stackHint: string;
    stackHintTouch: string;
    stackTop: string;
    stackBottom: string;
    layers: StackLayer[];
    ghTitle: string;
    ghSuffix: string;
    ghLess: string;
    ghMore: string;
    ghAria: string;
    ghMonths: string[];
    ghLevels: string[];
    ctaProduct: Link;
    ctaSeries: Link;
    next: string;
  };
  publico: {
    chapter: string;
    say: string;
    text: string;
    chips: Link[];
    postsLabel: string;
    posts: { title: string; sub: string; href: string }[];
    next: string;
  };
  scott: {
    chapter: string;
    petAria: string;
    clickHint: string;
    name: string;
    desc: string;
    alts: Record<ScottPose, string>;
    hoverSay: string;
    petSays: string[];
    zoomies: string;
    sendSay: string;
    faqTitleA: string;
    faqTitleEm: string;
    faqLead: string;
    faqVoice: string;
    faqs: Faq[];
    formLabel: string;
    placeholder: string;
    send: string;
    formNote: string;
    mailSubject: string;
  };
  contato: {
    chapter: string;
    titleA: string;
    titleEm: string;
    lead: string;
    ctaMail: string;
    ctaWhats: string;
    photoAlt: string;
    findLabel: string;
    rows: ContactRow[];
    footerL: string;
    footerR: string;
  };
  mini: { aria: string };
}

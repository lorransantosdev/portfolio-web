import { IntroToken } from './types';

export const LINKS = {
  email: 'lorransantossarmento@gmail.com',
  mailto: 'mailto:lorransantossarmento@gmail.com',
  whatsapp: 'https://wa.me/5511987885083',
  instagram: 'https://instagram.com/lorrandev',
  tiktok: 'https://tiktok.com/@lorrandev',
  youtube: 'https://youtube.com/@lorranndev',
  x: 'https://x.com/lorrandev',
  linkedin: 'https://www.linkedin.com/in/lorran-sarmento',
  github: 'https://github.com/lorransantosdev',
  mycarshub: 'https://mycarshub.app.br',
  playlistMyCarsHub: 'https://www.youtube.com/playlist?list=PL5NYr4AuWqW7NtaIMX-2HqPQQ1Ztk2_gU',
  playlistEventos: 'https://www.youtube.com/playlist?list=PL5NYr4AuWqW5JkH5jnHO0sf8B_5bLfv2o',
  postGs2026: 'https://www.linkedin.com/feed/update/urn:li:activity:7519387795694497792/',
  postNext2026: 'https://www.linkedin.com/feed/update/urn:li:activity:7520523944618258432/',
  postEfetivado: 'https://www.linkedin.com/feed/update/urn:li:activity:7490899249187110912/',
  resumePt: '/lorran-sarmento-cv-pt.pdf',
  resumeEn: '/lorran-sarmento-cv-en.pdf',
} as const;

export const SITE_URL = 'https://lorrandev.vercel.app';

export const GH_START = '2025-11-09';
export const GH_LEVELS =
  '00000000100000000010100000000000000000000000000000000000000000000000101100100101001000000000110001000000001111010000000110000000000011100000100010011101000010010011110111000010100100000001000010111000000000000000000000000010000000000000110100110010001101113431111121113021111111100110000011111101002110010111141344001123210100233100122311321111222341211232200132310221';
export const GH_TOTAL = 4404;

export function w(text: string): IntroToken[] {
  return text.split(' ').map((t) => ({ t }));
}

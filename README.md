# lorran

Meu portfólio: [lorrandev](https://github.com/lorransantosdev). Backend na Cielo de dia, MyCarsHub de noite.

Angular 20 (standalone, signals, zoneless) com prerender estático. As animações em 0 e 1 são Canvas 2D puro, sem lib de animação.

## Rodando

```bash
npm install
npm start          # http://localhost:4200 e /en
npm run build      # dist/portfolio-angular/browser
```

O build gera `index.html` (pt-BR) e `en/index.html`, cada um com seu `lang`, meta e Open Graph.

## Deploy

Vercel, usando o `vercel.json` da raiz. É só importar o repositório.

## Onde ficam as coisas

- Textos: `src/app/content/pt.ts` e `en.ts`
- Links, e-mail, dados do GitHub: `src/app/content/shared.ts`
- Cores e fontes: `src/styles.css`
- Seções: `src/app/sections/`
- Canvas em 0 e 1: `src/app/binary/`

## Scott com IA

O chat do Scott ainda não está ligado. Hoje a seção tem um FAQ e o formulário abre o e-mail.

`api/scott.ts` já chama a API da Anthropic. Pra ligar, configure `ANTHROPIC_API_KEY` e `SCOTT_AI_ENABLED=true` na Vercel e use o `ScottApiService` no formulário.

## A fazer

- [ ] Projeto de IA na Cielo
- [ ] Domínio próprio

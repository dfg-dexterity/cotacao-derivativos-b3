# CLAUDE.md — Notas do projeto

Aplicativo **Derivativos Listados B3** (Next.js, deploy no Vercel) da Dexterity IT
Solutions — antes chamado "Cotações de Derivativos B3". Baixa os arquivos oficiais da
Pesquisa por Pregão da B3 (`SPRD`/`PR`), parseia o XML BVBG (`PricRpt`) e exibe todas as
cotações dos contratos futuros. É uma das cinco ferramentas de Dados de Mercado (com
Calculadora MTM, Indicadores Econômicos, Moedas BNDES e Cotação de Moedas), que seguem
um padrão único de visual e de endereços.

- API: `GET /api/cotacoes?data=AAAA-MM-DD[&tipo=SPRD&prefixos=DI1,DOL&somente6=1&formato=csv]`
- Testes do parser (sem rede): `npm run testar` · Tipos: `npx tsc --noEmit` · Build: `npm run build`
- Rodar: `npm run dev` (ou `npx next build && npx next start -p <porta>`)

## Endereços

| O quê | Endereço |
| --- | --- |
| Página no site (**canônica**) | https://www.dexterityit.com.br/derivativos-listados-b3 |
| Aplicação (só no `src` do iframe do site) | https://cotacao-derivativos-b3.vercel.app |

Em cartão, rodapé, post, documentação, `canonical` e `og:url` vai **sempre** a página do
site (MK-02-004). O `*.vercel.app` só aparece no `src` do iframe dos blocos de `site/` e no
README/CLAUDE.md — nunca no HTML servido pelo app.

## Regras do padrão (não negociáveis)

- `app/dexterity.css` é **cópia byte a byte** da folha compartilhada pelas ferramentas de
  Dados de Mercado. **Não editar no app**; uma mudança é feita no padrão e replicada nos cinco
  apps. Ela é importada em `app/layout.tsx` **antes** de `app/globals.css`.
- Casca (barra `dxt-topbar`, faixa `dxt-pagehead`, rodapé `dxt-footer`) só com as classes do
  `dexterity.css`, sem estilo de casca no `globals.css`. Barra e rodapé em `app/Casca.tsx`;
  faixa de título em `app/page.tsx` (sobrancelha `01 / Dados de mercado · Ajustes do pregão`,
  um só `<h1>`).
- A coluna **Ferramentas** do rodapé é idêntica nos cinco apps; o link desta ferramenta leva
  `aria-current="page"`. Ao incluir ou renomear uma ferramenta, atualize nos cinco.
- `site/` é a fonte da verdade dos blocos do Odoo (página e cartão da vitrine) — não editar
  direto no Odoo. `site/` não é servido pelo Next (só `public/` é); não coloque os blocos em
  `public/`.
- Testar sempre a 1440 px e a **390 px**, normal e `?embed=1`: sem rolagem horizontal da
  página (`scrollWidth <= clientWidth`) e sem erro de JS. A B3 costuma estar bloqueada em
  ambientes de teste — simule `/api/cotacoes` (formato no README).

## Parâmetros de URL e incorporação em iframe (Odoo, Notion, intranet)

`next.config.mjs` envia `Content-Security-Policy: frame-ancestors *` (sem isso o navegador
recusa o embed; para restringir, troque o `*` pelo host) e `X-Content-Type-Options: nosniff`;
em `/api/*` também `X-Robots-Tag: noindex`.

O `embed` é lido por um script inline no `<head>` (`app/layout.tsx`) que põe `modo-embutido`
no `<html>` antes da primeira pintura (o `<html>` tem `suppressHydrationWarning` por isso). O
resto é lido no cliente, em `app/page.tsx`:

| Parâmetro   | Efeito                                                             |
| ----------- | ------------------------------------------------------------------ |
| `embed=1`   | Modo incorporado: o `dexterity.css` compacta a barra, esconde o título da faixa e as colunas do rodapé (fica só a nota) e usa a largura toda; a página já busca sozinha e os links absolutos abrem em outra aba |
| `filtros=0` | Esconde o formulário (só a tabela — bom para painel)                |
| `auto=1`    | Busca no carregamento sem entrar no modo incorporado                |
| `data`      | `AAAA-MM-DD`; padrão = dia útil anterior                            |
| `tipo`      | `SPRD` (padrão) ou `PR`                                             |
| `prefixos`  | Lista separada por vírgula, ex. `DI1,DOL`                           |
| `somente6=1`| Só tickers de 6 caracteres                                          |

## SEO

Em `app/layout.tsx` (padrão MK-02-003): título `Derivativos listados B3: ajustes e cotações
de futuros` (54 caracteres), descrição de 157 caracteres, `alternates.canonical` e `og:url` =
página do site, Open Graph/Twitter e JSON-LD `WebApplication` + `BreadcrumbList` (sem
`FAQPage`: as perguntas só aparecem na página do site). `app/robots.ts`: tudo liberado,
`/api/` bloqueado.

## Publicação no site (Odoo)

`site/odoo-pagina-derivativos-listados-b3.html` (conteúdo da página, com o iframe
`https://cotacao-derivativos-b3.vercel.app/?embed=1`, texto, perguntas frequentes e JSON-LD)
e `site/odoo-cartao-vitrine.html` (cartão da vitrine `/ferramentas` e linha do rodapé do
site). Título e descrição do "Otimizar SEO" estão no comentário do topo da página e no
README. Ordem: publicar a página → conferir o iframe em janela anônima e a 390 px → cartão da
vitrine → rodapé do site → Search Console.

## 🎨 Identidade visual Dexterity — SEMPRE USAR (pedido do usuário em 2026-07-30)

**Toda interface, página ou material criado neste projeto deve usar a logo e a
identidade visual da Dexterity.** Os ativos oficiais estão versionados em `brand/`:

| Arquivo                              | Uso                                              |
| ------------------------------------ | ------------------------------------------------ |
| `brand/logo-dexterity-horizontal.png`| Logo oficial completo (2342×626, fundo branco). Versão **limpa** — o original da skill `documento-dexterity` tem um cursor de mouse capturado sobre o "T", já removido aqui. |
| `brand/logo-dexterity.svg`           | Recriação vetorial aproximada (símbolo + texto) para usos que exijam SVG. |
| `brand/logo-dexterity-lockup-escuro.svg` | O lockup **oficial** traçado do site, em versão escura e autocontida — prefira este ao `logo-dexterity.svg` aproximado. |
| `brand/simbolo-dexterity.svg`        | Só o símbolo de 4 pétalas.                       |
| `public/logo-dexterity.png`          | Versão web do logo (504×128), grafite — não usar na interface (some sobre o fundo escuro). |
| `app/icon.svg`                       | Favicon padrão das ferramentas: símbolo de 4 pétalas sobre fundo grafite. |

Fonte primária dos ativos da marca (entre sessões/projetos): skill
`documento-dexterity` em `assets/brand/` (logo, banner de capa, decoração).

### Paleta oficial (tema escuro)

Mesmo sistema visual da Calculadora CDI/CDB e das demais ferramentas de Dados de
Mercado — os tokens vêm de `app/dexterity.css`. O tema é **escuro único** — não existe
variante clara.

| Cor             | Hex       | Token                | Uso                                   |
| --------------- | --------- | -------------------- | ------------------------------------- |
| Base            | `#1B1B1B` | `--dxt-base`         | Fundo de página                       |
| Superfície      | `#242424` | `--dxt-surface`      | Cartões                               |
| Superfície 2    | `#2E2E2E` | `--dxt-surface-2`    | Cabeçalho de tabela, realce de hover  |
| Off-white       | `#F7F3E7` | `--dxt-off`          | Texto principal, letras do logo       |
| Cerceta         | `#009994` | `--dxt-cerceta`      | Botões, preenchimentos, "IT" do logo  |
| Cerceta destaque| `#00B3AC` | `--dxt-acc-txt`      | Texto de acento, links, sobrancelhas, alta |
| Âmbar           | `#FFA436` | `--dxt-amarelo`      | Baixa/atenção e anel de foco          |
| Roxo            | `#98569A` | `--dxt-roxo`         | Nota informativa                      |
| Musgo           | `#597C59` | `--dxt-musgo`        | Série auxiliar de gráfico             |
| Vermelho        | `#D9563E` | `--dxt-vermelho`     | **Só** erro (texto: `--b3-vermelho-txt` `#DD6953`, do `globals.css`) |
| Fio             | `rgba(247,243,231,.13)` | `--dxt-line` | Bordas e divisores              |
| Rótulo          | `#908C85` | `--dxt-rotulo`       | Texto de apoio, rótulos em mono       |

**Cor tem sentido:** cerceta = alta/ganho, âmbar = baixa/atenção. Variação negativa
vai em âmbar (`dxt-down`), **não** em vermelho — o vermelho fica reservado a erro.

### Tipografia

- Títulos: **Barlow Condensed** 600, caixa alta (equivalente web da Proxima Soft ExCn)
- Corpo: **Figtree** 300 (equivalente web da Boston)
- Rótulos e números: **IBM Plex Mono** 400/500, com `tabular-nums`
- Carregadas do Google Fonts em `app/layout.tsx`.

### Forma

Cantos **retos** (raio 0) em todo contêiner, cartões **sem sombra** com fio de 1px,
grades separadas por fio de 1px. Foco visível: `outline: 2px solid #FFA436`, offset 3px.
Largura do contêiner: `--dxt-container` = `min(1180px, 92vw)` (no modo incorporado,
`100% - 32px`).

O logotipo é o componente `app/DexterityLogo.tsx`: gera exatamente o SVG inline do padrão
(`class="dxt-logo"`, cores por `--mk`/`--acc`), usado na barra e no rodapé. Nunca `<img>`/PNG.

### Skill `estilo-web-dexterity`

O mesmo tema está empacotado em `.claude/skills/estilo-web-dexterity/`, para aplicar a
identidade em **outros** programas. Contém uma folha CSS portátil
(`assets/dexterity.css`), os SVGs da marca, as receitas de componente
(`references/componentes.md`) e a checagem final (`references/checklist.md`):

```bash
.claude/skills/estilo-web-dexterity/scripts/instalar.sh              # ~/.claude/skills
.claude/skills/estilo-web-dexterity/scripts/instalar.sh /outro/repo  # .claude/skills de lá
```

A folha do skill usa o prefixo `--dx-*` e traz aliases de compatibilidade (inclusive
`--dxt-*`), então serve para um projeto novo ou para um que já use os tokens `--dxt-*`.
**Não é a folha deste app:** aqui o visual vem de `app/dexterity.css`, a folha compartilhada
das ferramentas de Dados de Mercado (cópia idêntica nos cinco apps), e só o que é desta tela
fica em `app/globals.css`. Não altere `.claude/skills/` ao mexer no visual do app.

## Infra

- Repositório GitHub: `dfg-dexterity/cotacao-derivativos-b3` (branch `main`).
- Vercel (time `dexterityit`): o endereço público usado pelo site é
  **https://cotacao-derivativos-b3.vercel.app** (projeto `cotacao-derivativos-b3`; informado
  pelo dono em 05/10/2026). É o único que pode ir no iframe — não apagar esse projeto.
- O projeto **`mercado-b3`** (https://mercado-b3-dexterityit.vercel.app) tem a proteção da
  Vercel (tela de login): **não usar** em iframe nem em links. `dados-de-mercado-b3` está
  obsoleto.
- **Limitação da integração Vercel MCP**: só consegue publicar ao CRIAR um projeto
  novo; qualquer deploy em projeto existente retorna 403. Fix definitivo: conectar
  o repositório GitHub ao projeto no painel do Vercel (Settings → Git) para deploy
  automático a cada push na `main`.

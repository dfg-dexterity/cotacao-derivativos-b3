# CLAUDE.md — Notas do projeto

Aplicativo **Cotações de Derivativos B3** (Next.js, deploy no Vercel) da Dexterity IT
Solutions. Baixa os arquivos oficiais da Pesquisa por Pregão da B3 (`SPRD`/`PR`),
parseia o XML BVBG (`PricRpt`) e exibe todas as cotações dos contratos futuros.

- API: `GET /api/cotacoes?data=AAAA-MM-DD[&tipo=SPRD&prefixos=DI1,DOL&somente6=1&formato=csv]`
- Testes do parser (sem rede): `npm run testar` · Build: `npm run build`

## Incorporação em iframe (Odoo, Notion, intranet)

`next.config.mjs` envia `Content-Security-Policy: frame-ancestors *` — sem isso o
navegador recusa o embed. Para restringir a um domínio, troque o `*` pelo host.

A página aceita parâmetros de URL (lidos no cliente, em `app/page.tsx`):

| Parâmetro   | Efeito                                                             |
| ----------- | ------------------------------------------------------------------ |
| `embed=1`   | Modo compacto: sem faixa de título e sem rodapé, e já busca sozinho |
| `filtros=0` | Esconde o formulário (só a tabela — bom para painel)                |
| `auto=1`    | Busca no carregamento sem entrar no modo compacto                   |
| `data`      | `AAAA-MM-DD`; padrão = último dia útil                              |
| `tipo`      | `SPRD` (padrão) ou `PR`                                             |
| `prefixos`  | Lista separada por vírgula, ex. `DI1,DOL`                           |
| `somente6=1`| Só tickers de 6 caracteres                                          |

## 🎨 Identidade visual Dexterity — SEMPRE USAR (pedido do usuário em 2026-07-30)

**Toda interface, página ou material criado neste projeto deve usar a logo e a
identidade visual da Dexterity.** Os ativos oficiais estão versionados em `brand/`:

| Arquivo                              | Uso                                              |
| ------------------------------------ | ------------------------------------------------ |
| `brand/logo-dexterity-horizontal.png`| Logo oficial completo (2342×626, fundo branco). Versão **limpa** — o original da skill `documento-dexterity` tem um cursor de mouse capturado sobre o "T", já removido aqui. |
| `brand/logo-dexterity.svg`           | Recriação vetorial aproximada (símbolo + texto) para usos que exijam SVG. |
| `brand/logo-dexterity-lockup-escuro.svg` | O lockup **oficial** traçado do site, em versão escura e autocontida — prefira este ao `logo-dexterity.svg` aproximado. |
| `brand/simbolo-dexterity.svg`        | Só o símbolo de 4 pétalas.                       |
| `public/logo-dexterity.png`          | Versão web do logo (504×128) usada no cabeçalho do app. |
| `app/icon.png`                       | Favicon com o símbolo oficial (4 pétalas).       |

Fonte primária dos ativos da marca (entre sessões/projetos): skill
`documento-dexterity` em `assets/brand/` (logo, banner de capa, decoração).

### Paleta oficial (tema escuro)

Mesmo sistema visual da Calculadora CDI/CDB e das demais ferramentas de Dados de
Mercado. O tema é **escuro único** — não existe variante clara.

| Cor             | Hex       | Uso                                             |
| --------------- | --------- | ----------------------------------------------- |
| Base            | `#1B1B1B` | Fundo de página                                 |
| Superfície      | `#242424` | Cartões                                         |
| Superfície 2    | `#2E2E2E` | Cabeçalho de tabela, realce de hover            |
| Off-white       | `#F7F3E7` | Texto principal, letras do logo                 |
| Cerceta         | `#009994` | Botões, preenchimentos, "IT" do logo            |
| Cerceta destaque| `#00B3AC` | Texto de acento, links, sobrancelhas, alta      |
| Âmbar           | `#FFA436` | Baixa/atenção e anel de foco                    |
| Roxo            | `#98569A` | Nota informativa, crosshair de gráfico          |
| Musgo           | `#597C59` | Série auxiliar de gráfico                       |
| Vermelho        | `#D9563E` | **Só** erro e dedução                           |
| Fio             | `rgba(247,243,231,.13)` | Bordas e divisores                |
| Rótulo          | `#908C85` | Texto de apoio, rótulos em mono                 |

**Cor tem sentido:** cerceta = alta/ganho, âmbar = baixa/atenção. Variação negativa
vai em âmbar, **não** em vermelho — o vermelho fica reservado a erro.

### Tipografia

- Títulos: **Barlow Condensed** 600, caixa alta (equivalente web da Proxima Soft ExCn)
- Corpo: **Figtree** 300 (equivalente web da Boston)
- Rótulos e números: **IBM Plex Mono** 400/500, com `tabular-nums`
- Carregadas do Google Fonts em `app/layout.tsx`.

### Forma

Cantos **retos** (raio 0) em todo contêiner, cartões **sem sombra** com fio de 1px,
grades separadas por fio de 1px. Foco visível: `outline: 2px solid #FFA436`, offset 3px.

O logotipo é o componente `app/DexterityLogo.tsx` (SVG inline, cores por variável CSS).
Não use `public/logo-dexterity.png` na interface: é grafite e fica ilegível sobre o
fundo escuro — ele permanece no repo apenas para usos fora do app.

### Skill `estilo-web-dexterity`

Este mesmo tema está empacotado em `.claude/skills/estilo-web-dexterity/`, para
aplicar a identidade em **outros** programas. Contém a folha CSS autocontida
(`assets/dexterity.css`), os SVGs da marca, as receitas de componente
(`references/componentes.md`) e a checagem final (`references/checklist.md`):

```bash
.claude/skills/estilo-web-dexterity/scripts/instalar.sh              # ~/.claude/skills
.claude/skills/estilo-web-dexterity/scripts/instalar.sh /outro/repo  # .claude/skills de lá
```

A folha do skill usa o prefixo `--dx-*` e traz aliases de compatibilidade
(inclusive `--dxt-*`, o prefixo usado aqui em `app/globals.css`), então serve
tanto para um projeto novo quanto para um que já siga a convenção deste repo.
Ela é a cópia canônica: este app **não** a consome — o estilo daqui vive em
`app/globals.css`.

## Infra

- Repositório GitHub: `dfg-dexterity/cotacao-derivativos-b3` (branch `main`).
- Vercel (time `dexterityit`): projeto ativo **`mercado-b3`**
  (https://mercado-b3-dexterityit.vercel.app). Os projetos `cotacao-derivativos-b3`
  e `dados-de-mercado-b3` ficaram obsoletos e podem ser apagados no painel.
- **Limitação da integração Vercel MCP**: só consegue publicar ao CRIAR um projeto
  novo; qualquer deploy em projeto existente retorna 403. Fix definitivo: conectar
  o repositório GitHub ao projeto no painel do Vercel (Settings → Git) para deploy
  automático a cada push na `main`.

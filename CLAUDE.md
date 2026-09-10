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
identidade visual da Dexterity.**

Desde 2026-09-10 o app segue o **tema escuro do site institucional**
(dexterityit.com.br), e não mais a paleta clara sobre creme. A folha da marca
mora em `app/dexterity.css` e é a fonte única de cor, tipografia e componente —
`app/globals.css` só trata do que é específico desta ferramenta.

### Skill `estilo-web-dexterity`

O tema está empacotado em `.claude/skills/estilo-web-dexterity/`, para aplicar a
mesma identidade em outros programas. Contém a folha CSS, os SVGs da marca, as
receitas de componente (`references/componentes.md`) e a checagem final
(`references/checklist.md`). Para usar em outro projeto:

```bash
.claude/skills/estilo-web-dexterity/scripts/instalar.sh              # ~/.claude/skills
.claude/skills/estilo-web-dexterity/scripts/instalar.sh /outro/repo  # .claude/skills de lá
```

`assets/dexterity.css` do skill precisa ser idêntico a `app/dexterity.css`.
`npm run testar` verifica isso; se acusar divergência, `cp app/dexterity.css
.claude/skills/estilo-web-dexterity/assets/dexterity.css`.

### Paleta oficial (tema escuro)

| Token                | Hex                     | Uso                                |
| -------------------- | ----------------------- | ---------------------------------- |
| `--dx-base`          | `#1B1B1B`               | Fundo da página                    |
| `--dx-surface`       | `#242424`               | Cartões e painéis                  |
| `--dx-surface-2`     | `#2E2E2E`               | Cabeçalho de painel e de tabela    |
| `--dx-surface-3`     | `#1F1F1F`               | Fundo de campo                     |
| `--dx-line`          | `rgba(247,243,231,.13)` | Filetes (a "grade" da marca)       |
| `--dx-cerceta`       | `#009994`               | Ação: botão, borda, filete         |
| `--dx-cerceta-texto` | `#00B3AC`               | Cerceta **em texto** (contraste AA)|
| `--dx-amarelo`       | `#FFA436`               | Foco, alerta, baixa                |
| `--dx-off`           | `#F7F3E7`               | Texto principal                    |
| `--dx-rotulo`        | `#908C85`               | Rótulo mono                        |
| `--dx-roxo`/`--dx-musgo` | `#98569A`/`#597C59` | Acento de categoria                |

Cantos vivos em tudo (`border-radius: 0`), separação por filete de 1px em vez de
sombra, e alta/baixa seguem o ticker do site: cerceta sobe, âmbar cai.

### Tipografia

- Títulos: **Barlow Condensed** 600, caixa alta, `line-height: .92`
- Corpo: **Figtree** 300, 17px
- Rótulos técnicos: **IBM Plex Mono** 11px, caixa alta, `letter-spacing: .13em`

Carregadas por `<link>` em `app/layout.tsx` (e não por `next/font`) para que
`dexterity.css` continue colável em projetos sem build, como o site em Odoo.

### Ativos da marca

| Arquivo                                   | Uso                                          |
| ----------------------------------------- | -------------------------------------------- |
| `app/componentes/MarcaDexterity.tsx`      | Lockup oficial em SVG inline — **use este** no app; as pétalas herdam as cores do tema e animam no hover. |
| `brand/logo-dexterity-lockup-escuro.svg`  | O mesmo lockup, autocontido, para uso fora do React. |
| `brand/simbolo-dexterity.svg`             | Só o símbolo de 4 pétalas.                   |
| `brand/logo-dexterity-horizontal.png`     | Logo oficial completo (2342×626, fundo branco) — **não serve no tema escuro**. |
| `public/logo-dexterity.png`               | Versão web antiga (fundo branco); mantida para materiais em fundo claro. |
| `app/icon.png`                            | Favicon com o símbolo oficial.               |

Fonte primária dos ativos entre sessões/projetos: skill `documento-dexterity`
(`assets/brand/`) para material impresso, e este skill para web.

## Infra

- Repositório GitHub: `dfg-dexterity/cotacao-derivativos-b3` (branch `main`).
- Vercel (time `dexterityit`): projeto ativo **`mercado-b3`**
  (https://mercado-b3-dexterityit.vercel.app). Os projetos `cotacao-derivativos-b3`
  e `dados-de-mercado-b3` ficaram obsoletos e podem ser apagados no painel.
- **Limitação da integração Vercel MCP**: só consegue publicar ao CRIAR um projeto
  novo; qualquer deploy em projeto existente retorna 403. Fix definitivo: conectar
  o repositório GitHub ao projeto no painel do Vercel (Settings → Git) para deploy
  automático a cada push na `main`.

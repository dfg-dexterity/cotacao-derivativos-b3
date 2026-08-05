# CLAUDE.md — Notas do projeto

Aplicativo **Cotações de Derivativos B3** (Next.js, deploy no Vercel) da Dexterity IT
Solutions. Baixa os arquivos oficiais da Pesquisa por Pregão da B3 (`SPRD`/`PR`),
parseia o XML BVBG (`PricRpt`) e exibe todas as cotações dos contratos futuros.

- API: `GET /api/cotacoes?data=AAAA-MM-DD[&tipo=SPRD&prefixos=DI1,DOL&somente6=1&formato=csv]`
- Testes do parser (sem rede): `npm run testar` · Build: `npm run build`

## 🎨 Identidade visual Dexterity — SEMPRE USAR (pedido do usuário em 2026-07-30)

**Toda interface, página ou material criado neste projeto deve usar a logo e a
identidade visual da Dexterity.** Os ativos oficiais estão versionados em `brand/`:

| Arquivo                              | Uso                                              |
| ------------------------------------ | ------------------------------------------------ |
| `brand/logo-dexterity-horizontal.png`| Logo oficial completo (2342×626, fundo branco). Versão **limpa** — o original da skill `documento-dexterity` tem um cursor de mouse capturado sobre o "T", já removido aqui. |
| `brand/logo-dexterity.svg`           | Recriação vetorial aproximada (símbolo + texto) para usos que exijam SVG. |
| `public/logo-dexterity.png`          | Versão web do logo (504×128) usada no cabeçalho do app. |
| `app/icon.png`                       | Favicon com o símbolo oficial (4 pétalas).       |

Fonte primária dos ativos da marca (entre sessões/projetos): skill
`documento-dexterity` em `assets/brand/` (logo, banner de capa, decoração).

### Paleta oficial

| Cor            | Hex       | Uso                                        |
| -------------- | --------- | ------------------------------------------ |
| Teal (primária)| `#009994` | Destaques, botões, links, filetes, "IT" do logo |
| Teal escuro    | `#007D79` | Hover de botões/links                      |
| Grafite        | `#3D3D3D` | Faixas de título, rodapé, texto do logo    |
| Grafite claro  | `#4D4D4D` | Cabeçalhos de tabela (texto branco)        |
| Creme          | `#F7F3E7` | Fundo de página                            |
| Cinza          | `#CCCCCC` | Bordas/divisores                           |

### Tipografia

- Títulos: **Proxima Soft ExCn** (fallbacks: Proxima Soft, Arial Narrow, Roboto Condensed)
- Corpo: **Boston** (fallbacks: Segoe UI/system)
- Títulos em caixa alta condensada dão a cara da marca (como no logo DEXTERITY).

Padrões de componente já aplicados em `app/globals.css`: tabela com cabeçalho
grafite + filete teal, cartões brancos sobre fundo creme, chips arredondados,
rodapé grafite com a marca.

## Infra

- Repositório GitHub: `dfg-dexterity/cotacao-derivativos-b3` (branch `main`).
- Vercel (time `dexterityit`): projeto ativo **`mercado-b3`**
  (https://mercado-b3-dexterityit.vercel.app). Os projetos `cotacao-derivativos-b3`
  e `dados-de-mercado-b3` ficaram obsoletos e podem ser apagados no painel.
- **Limitação da integração Vercel MCP**: só consegue publicar ao CRIAR um projeto
  novo; qualquer deploy em projeto existente retorna 403. Fix definitivo: conectar
  o repositório GitHub ao projeto no painel do Vercel (Settings → Git) para deploy
  automático a cada push na `main`.

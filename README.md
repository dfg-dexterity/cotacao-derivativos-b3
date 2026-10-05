# Derivativos Listados B3

Aplicativo web (Next.js) da Dexterity IT Solutions para consultar **ajustes e cotações dos contratos futuros da B3**, direto dos arquivos oficiais da [Pesquisa por Pregão](https://www.b3.com.br/pt_br/market-data-e-indices/servicos-de-dados/market-data/historico/boletins-diarios/pesquisa-por-pregao/pesquisa-por-pregao/). Feito para rodar no **Vercel** e para ser incorporado na página da ferramenta no site da Dexterity. É uma das ferramentas de Dados de Mercado, junto com Calculadora MTM, Indicadores Econômicos, Moedas BNDES e Cotação de Moedas.

## Endereços

| O quê | Endereço | Uso |
| --- | --- | --- |
| Página no site (**canônica**) | https://www.dexterityit.com.br/derivativos-listados-b3 | Link público: cartão, rodapé, posts, documentação, `canonical` e `og:url` |
| Aplicação | https://cotacao-derivativos-b3.vercel.app | Só no `src` do iframe da página do site (`/?embed=1`) |
| Repositório | `dfg-dexterity/cotacao-derivativos-b3` | Fonte da verdade do app e dos blocos do site (`site/`) |

Regra da MK-02-004: em cartão, rodapé, post, documentação e `canonical` vai **sempre** o endereço no domínio da Dexterity. O `*.vercel.app` aparece só no `src` do iframe e neste README. Não use `mercado-b3-dexterityit.vercel.app`: o projeto tem a proteção da Vercel e mostra tela de login dentro do iframe.

## Como funciona

1. A API baixa o ZIP do dia na B3 (`https://www.b3.com.br/pesquisapregao/download?filelist=SPRD<AAMMDD>.zip`);
2. Trata ZIP aninhado (ZIP dentro de ZIP) e extrai o XML no padrão BVBG (`PricRpt`);
3. Parseia todos os instrumentos e devolve JSON ou CSV;
4. A interface exibe a tabela com busca, ordenação, filtro por prefixo de ticker e exportação para CSV (compatível com Excel em português).

Por padrão são retornadas **todas as cotações** do arquivo. Os filtros por prefixo (ex.: `DI1`, `DOL`) e por tickers de 6 caracteres (contratos padrão, excluindo estratégias/spreads) são opcionais.

## Parâmetros de URL

Lidos no cliente (`app/page.tsx`), exceto o `embed`, que o script do `<head>` (`app/layout.tsx`) lê antes da primeira pintura.

| Parâmetro    | Efeito |
| ------------ | ------ |
| `embed=1`    | Modo incorporado (iframe do site, Notion, intranet): põe `modo-embutido` no `<html>`; o `dexterity.css` compacta a barra, esconde o título da faixa e as colunas do rodapé (fica só a nota) e usa a largura toda. A consulta já é disparada no carregamento e os links absolutos abrem em outra aba. |
| `filtros=0`  | Esconde o formulário (só a tabela — bom para painel) |
| `auto=1`     | Busca no carregamento sem entrar no modo incorporado |
| `data`       | `AAAA-MM-DD`; padrão = dia útil anterior |
| `tipo`       | `SPRD` (padrão) ou `PR` |
| `prefixos`   | Lista separada por vírgula, ex. `DI1,DOL` |
| `somente6=1` | Só tickers de 6 caracteres |

Exemplos: `/?embed=1` (o iframe do site), `/?embed=1&filtros=0&prefixos=DI1&somente6=1` (painel só com a curva de DI).

## Rodando localmente

```bash
npm install
npm run dev        # http://localhost:3000
npm run testar     # testes do parser (sem rede)
npm run build      # build de produção
```

## Deploy no Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dfg-dexterity/cotacao-derivativos-b3)

Ou via CLI:

```bash
npm i -g vercel
vercel
```

Projeto no Vercel: `cotacao-derivativos-b3` (time `dexterityit`), que responde em https://cotacao-derivativos-b3.vercel.app. Não é necessária nenhuma variável de ambiente. A rota da API usa `maxDuration = 60` (o arquivo `SPRD` leva alguns segundos para baixar e parsear) e região preferencial `gru1` (São Paulo). Respostas de dias passados são cacheadas na CDN por 24 h.

## API

### `GET /api/cotacoes`

| Parâmetro  | Obrigatório | Descrição                                                                     |
| ---------- | ----------- | ----------------------------------------------------------------------------- |
| `data`     | sim         | Dia do pregão no formato `AAAA-MM-DD` (apenas dias úteis)                     |
| `tipo`     | não         | Tipo do arquivo da Pesquisa por Pregão (padrão `SPRD`; `PR` também aceito)    |
| `prefixos` | não         | Lista separada por vírgula (ex.: `DI1,DOL`). Vazio retorna todas as cotações  |
| `somente6` | não         | `1` mantém apenas tickers de 6 caracteres (contratos padrão)                  |
| `formato`  | não         | `csv` devolve CSV; padrão é JSON                                              |

Exemplos:

```
/api/cotacoes?data=2026-07-01
/api/cotacoes?data=2026-07-01&prefixos=DI1,DOL&somente6=1
/api/cotacoes?data=2026-07-01&formato=csv
```

Resposta JSON:

```json
{
  "arquivo": "SPRD260701.zip",
  "data": "2026-07-01",
  "tipo": "SPRD",
  "total": 1234,
  "total_no_arquivo": 5678,
  "cotacoes": [
    {
      "trade_date": "2026-07-01",
      "ticker": "DI1F27",
      "open_interest": 1500000,
      "first_price": 98000.0,
      "min_price": 97900.0,
      "max_price": 98100.0,
      "avg_price": 98010.55,
      "last_price": 98050.0,
      "trades_qty": 3200,
      "adjusted_quote": 98055.123,
      "adjusted_quote_status": "1",
      "prev_adjusted_quote": 97950.0,
      "prev_adjusted_status": "1",
      "adjusted_quote_change_pct": 0.1073,
      "currency": "BRL",
      "instrument_id": "200001234",
      "market": "BVMF"
    }
  ]
}
```

## Publicação no site (Odoo)

A página https://www.dexterityit.com.br/derivativos-listados-b3 é a casca padrão das páginas de ferramenta do site (faixa de cotações, menu, rodapé e CSS `.dxt`) mais um bloco **Código Incorporado** colado a partir deste repositório — `site/` é a fonte da verdade; não edite direto no Odoo.

| Arquivo | Onde entra |
| --- | --- |
| `site/odoo-pagina-derivativos-listados-b3.html` | Conteúdo da página `/derivativos-listados-b3`: título, iframe do app em `?embed=1`, texto, perguntas frequentes e JSON-LD (`WebApplication`, `BreadcrumbList`, `FAQPage`) |
| `site/odoo-cartao-vitrine.html` | Cartão da vitrine `/ferramentas` (dentro da `<div class="dx-tools">`) e a linha da coluna "Ferramentas" do rodapé do site |

Odoo › **Otimizar SEO** da página:

- Título: `Derivativos listados B3: ajustes e cotações de futuros` (54 caracteres)
- Descrição: `Ajustes e cotações de todos os contratos futuros da B3 (DI1, DOL, WIN, IND e mais), direto da Pesquisa por Pregão, com filtros e exportação em CSV para Excel.` (157 caracteres)

Ordem de publicação:

1. Publicar a página com o bloco de `site/odoo-pagina-derivativos-listados-b3.html` e o SEO acima.
2. Conferir o iframe em janela anônima (sem tela de login da Vercel, consulta carregando) e a 390 px de largura.
3. Publicar o cartão da vitrine (`site/odoo-cartao-vitrine.html`).
4. Incluir a linha no rodapé do site (coluna "Ferramentas").
5. Search Console: inspecionar a URL da página e pedir a indexação.

## Identidade visual

A interface é a mesma casca das demais ferramentas de Dados de Mercado e do site da Dexterity (tema escuro único, cantos retos, sem sombra, filete de 1px; Barlow Condensed nos títulos, Figtree no texto, IBM Plex Mono nos rótulos e números).

- `app/dexterity.css` — folha compartilhada da marca, **cópia byte a byte** da usada nos outros apps (tokens `--dxt-*`, barra de marca, faixa de título, rodapé, cartão, botões, campos, chips, celular e modo incorporado). Não edite aqui: uma mudança vale para todos os apps e é replicada nos cinco.
- `app/globals.css` — só o que é desta tela (formulário, atalhos de prefixo, estados, tabela, paginação), sempre com os tokens `--dxt-*` e a largura `--dxt-container`. Nada de estilo de casca.
- `app/Casca.tsx` — barra de marca (`dxt-topbar`) e rodapé (`dxt-footer`). A coluna **Ferramentas** do rodapé é idêntica nos cinco apps; ao incluir ou renomear uma ferramenta, atualize nos cinco. A faixa de título (`dxt-pagehead`) está em `app/page.tsx`.
- `app/DexterityLogo.tsx` — o lockup oficial em SVG inline (classe `dxt-logo`, cores por `--mk`/`--acc`), igual ao dos apps estáticos.
- `app/icon.svg` — favicon padrão (símbolo de 4 pétalas sobre grafite).
- `brand/` — os ativos da marca em SVG/PNG, para uso fora do React.

À parte, o tema está empacotado como skill do Claude Code em `.claude/skills/estilo-web-dexterity/` (folha portátil com prefixo `--dx-*` e aliases `--dxt-*`, SVGs da marca, receitas de componente e checagem final), para aplicar a identidade em outros projetos. Este app não importa a folha do skill — usa a `app/dexterity.css` da família de Dados de Mercado.

```bash
.claude/skills/estilo-web-dexterity/scripts/instalar.sh              # para o usuário
.claude/skills/estilo-web-dexterity/scripts/instalar.sh /outro/repo  # para outro projeto
```

## SEO

Metadados em `app/layout.tsx` (padrão MK-02-003): título e descrição acima, `canonical` e `og:url` apontando para a página do site, Open Graph, `twitter:card summary` e JSON-LD (`WebApplication` + `BreadcrumbList`). `app/robots.ts` libera tudo e bloqueia `/api/`; a API também responde com `X-Robots-Tag: noindex` (`next.config.mjs`).

## Limitações e observações

- A B3 publica os arquivos **apenas em dias úteis**, normalmente após o fechamento do pregão. Para datas sem arquivo a API responde `404` com mensagem explicativa.
- O arquivo `PR` (Price Report completo) é grande e pode se aproximar do tempo limite da função (60 s). O `SPRD` (derivativos) é rápido.
- Aplicativo **não oficial**, sem vínculo com a B3. Os dados são públicos; confira sempre as fontes oficiais antes de decisões de investimento.

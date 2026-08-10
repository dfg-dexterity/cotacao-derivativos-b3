# Cotações de Derivativos — B3

Aplicativo web (Next.js) para consultar **ajustes e cotações dos contratos futuros da B3**, direto dos arquivos oficiais da [Pesquisa por Pregão](https://www.b3.com.br/pt_br/market-data-e-indices/servicos-de-dados/market-data/historico/boletins-diarios/pesquisa-por-pregao/pesquisa-por-pregao/). Feito para rodar no **Vercel**.

## Como funciona

1. A API baixa o ZIP do dia na B3 (`https://www.b3.com.br/pesquisapregao/download?filelist=SPRD<AAMMDD>.zip`);
2. Trata ZIP aninhado (ZIP dentro de ZIP) e extrai o XML no padrão BVBG (`PricRpt`);
3. Parseia todos os instrumentos e devolve JSON ou CSV;
4. A interface exibe a tabela com busca, ordenação, filtro por prefixo de ticker e exportação para CSV (compatível com Excel em português).

Por padrão são retornadas **todas as cotações** do arquivo. Os filtros por prefixo (ex.: `DI1`, `DOL`) e por tickers de 6 caracteres (contratos padrão, excluindo estratégias/spreads) são opcionais.

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

Não é necessária nenhuma variável de ambiente. A rota da API usa `maxDuration = 60` (o arquivo `SPRD` leva alguns segundos para baixar e parsear) e região preferencial `gru1` (São Paulo). Respostas de dias passados são cacheadas na CDN por 24 h.

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

## Limitações e observações

- A B3 publica os arquivos **apenas em dias úteis**, normalmente após o fechamento do pregão. Para datas sem arquivo a API responde `404` com mensagem explicativa.
- O arquivo `PR` (Price Report completo) é grande e pode se aproximar do tempo limite da função (60 s). O `SPRD` (derivativos) é rápido.
- Aplicativo **não oficial**, sem vínculo com a B3. Os dados são públicos; confira sempre as fontes oficiais antes de decisões de investimento.

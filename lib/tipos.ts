// Tipos e metadados compartilhados entre a API (servidor) e a interface (cliente).

export interface Cotacao {
  trade_date: string | null;
  ticker: string | null;
  instrument_id: string | null;
  market: string | null;
  open_interest: number | null;
  first_price: number | null;
  min_price: number | null;
  max_price: number | null;
  avg_price: number | null;
  last_price: number | null;
  trades_qty: number | null;
  adjusted_quote: number | null;
  adjusted_quote_status: string | null;
  prev_adjusted_quote: number | null;
  prev_adjusted_status: string | null;
  adjusted_quote_change_pct: number | null;
  currency: string | null;
}

export type ChaveColuna = keyof Cotacao;

export interface Coluna {
  chave: ChaveColuna;
  rotulo: string;
  tipo: 'data' | 'texto' | 'inteiro' | 'preco';
}

// Ordem em que as colunas aparecem na tabela e no CSV exportado.
export const COLUNAS: Coluna[] = [
  { chave: 'trade_date', rotulo: 'Data do pregão', tipo: 'data' },
  { chave: 'ticker', rotulo: 'Ticker', tipo: 'texto' },
  { chave: 'open_interest', rotulo: 'Contratos em aberto', tipo: 'inteiro' },
  { chave: 'first_price', rotulo: 'Abertura', tipo: 'preco' },
  { chave: 'min_price', rotulo: 'Mínimo', tipo: 'preco' },
  { chave: 'max_price', rotulo: 'Máximo', tipo: 'preco' },
  { chave: 'avg_price', rotulo: 'Médio', tipo: 'preco' },
  { chave: 'last_price', rotulo: 'Último', tipo: 'preco' },
  { chave: 'trades_qty', rotulo: 'Negócios', tipo: 'inteiro' },
  { chave: 'adjusted_quote', rotulo: 'Ajuste', tipo: 'preco' },
  { chave: 'prev_adjusted_quote', rotulo: 'Ajuste anterior', tipo: 'preco' },
  { chave: 'adjusted_quote_change_pct', rotulo: 'Var. ajuste (%)', tipo: 'preco' },
  { chave: 'adjusted_quote_status', rotulo: 'Status ajuste', tipo: 'texto' },
  { chave: 'prev_adjusted_status', rotulo: 'Status ajuste ant.', tipo: 'texto' },
  { chave: 'currency', rotulo: 'Moeda', tipo: 'texto' },
  { chave: 'instrument_id', rotulo: 'Cód. instrumento', tipo: 'texto' },
  { chave: 'market', rotulo: 'Mercado', tipo: 'texto' },
];

// Prefixos mais consultados, exibidos como atalhos na interface.
export const PREFIXOS_SUGERIDOS = [
  'DI1', 'DOL', 'WDO', 'IND', 'WIN', 'DAP', 'FRC', 'BGI', 'CCM', 'ICF', 'SJC', 'BIT',
];

// Gera CSV compatível com Excel em português (separador ";", decimal com vírgula, BOM UTF-8).
export function gerarCsv(cotacoes: Cotacao[]): string {
  const cabecalho = COLUNAS.map((coluna) => coluna.rotulo).join(';');
  const linhas = cotacoes.map((cotacao) =>
    COLUNAS.map((coluna) => {
      const valor = cotacao[coluna.chave];
      if (valor === null || valor === undefined) return '';
      if (coluna.tipo === 'inteiro' || coluna.tipo === 'preco') {
        return String(valor).replace('.', ',');
      }
      const texto = String(valor);
      return /[;"\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
    }).join(';'),
  );
  return '\uFEFF' + [cabecalho, ...linhas].join('\r\n');
}

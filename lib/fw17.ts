// Planilha de apoio à digitação na FW17 (cadastro de instrumentos no SAP).
// Não é carga automática nem upload: é uma folha para o usuário consultar e
// colar, campo a campo, na transação do GUI.
//
// Duas famílias de colunas:
//   (A) "Dados do instrumento" — o que o app sabe, vindo da fonte oficial (B3).
//   (B) "Preencher no SAP"     — em branco de propósito (dependem do cliente).

import type { Cotacao } from './tipos';

export const ROTULOS_SAP = [
  'Tipo de produto',
  'Categoria de classe',
  'Empresa',
  'Moeda da classe',
  'Referência de conta',
] as const;

export const ROTULOS_INSTRUMENTO = [
  'Ticker',
  'Código do instrumento',
  'Mercado',
  'Moeda',
  'Data do pregão',
  'Ajuste',
  'Mercadoria',
  'Vencimento',
] as const;

// Códigos de mês de vencimento dos futuros (F=jan ... Z=dez).
const CODIGOS_MES = 'FGHJKMNQUVXZ';

// Padrão estrito: 3 caracteres de mercadoria (começa em letra; ex. DI1, DOL,
// WIN), código de mês e 2 dígitos de ano — exatamente 6 caracteres. Qualquer
// outro formato (spreads como DI1F27F29, opções etc.) fica sem derivação.
const PADRAO_TICKER = new RegExp(`^([A-Z][A-Z0-9]{2})([${CODIGOS_MES}])(\\d{2})$`);

export function derivarDoTicker(ticker: string | null): {
  mercadoria: string;
  vencimento: string;
} {
  const casamento = PADRAO_TICKER.exec((ticker ?? '').trim().toUpperCase());
  if (!casamento) return { mercadoria: '', vencimento: '' };
  return { mercadoria: casamento[1], vencimento: `${casamento[2]}${casamento[3]}` };
}

export function datasDisponiveis(cotacoes: Cotacao[]): string[] {
  const datas = new Set<string>();
  for (const cotacao of cotacoes) if (cotacao.trade_date) datas.add(cotacao.trade_date);
  return [...datas].sort().reverse();
}

// Uma linha por instrumento. Para cada um vale a cotação mais recente na data
// de referência ou antes dela (ISO AAAA-MM-DD compara como texto).
export function consolidarPorInstrumento(cotacoes: Cotacao[], dataReferencia: string): Cotacao[] {
  const porInstrumento = new Map<string, Cotacao>();
  for (const cotacao of cotacoes) {
    const chave = cotacao.instrument_id || cotacao.ticker;
    if (!chave) continue;
    const data = cotacao.trade_date ?? '';
    if (data > dataReferencia) continue;
    const atual = porInstrumento.get(chave);
    if (!atual || data > (atual.trade_date ?? '')) porInstrumento.set(chave, cotacao);
  }
  return [...porInstrumento.values()];
}

function paraDataExcel(iso: string | null): Date | null {
  const casamento = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
  if (!casamento) return null;
  return new Date(Date.UTC(Number(casamento[1]), Number(casamento[2]) - 1, Number(casamento[3])));
}

export function linhasFw17(instrumentos: Cotacao[]): (string | number | Date | null)[][] {
  return instrumentos.map((cotacao) => {
    const { mercadoria, vencimento } = derivarDoTicker(cotacao.ticker);
    return [
      cotacao.ticker,
      cotacao.instrument_id,
      cotacao.market,
      cotacao.currency,
      paraDataExcel(cotacao.trade_date),
      cotacao.adjusted_quote,
      mercadoria || null,
      vencimento || null,
      ...ROTULOS_SAP.map(() => null),
    ];
  });
}

const COR_BASE = 'FF1B1B1B';
const COR_OFF = 'FFF7F3E7';
const COR_CERCETA = 'FF009994';
const COR_AMBAR = 'FFFFA436';

// Gera o .xlsx (exceljs é carregado sob demanda, só no clique do botão).
export async function gerarPlanilhaFw17(instrumentos: Cotacao[]): Promise<Blob> {
  const { default: ExcelJS } = await import('exceljs');
  const pasta = new ExcelJS.Workbook();
  const aba = pasta.addWorksheet('FW17', { views: [{ state: 'frozen', ySplit: 1 }] });

  const rotulos = [...ROTULOS_INSTRUMENTO, ...ROTULOS_SAP];
  aba.columns = rotulos.map((rotulo, indice) => ({
    header: rotulo,
    // Larguras legíveis; as colunas de preenchimento são mais largas.
    width: indice >= ROTULOS_INSTRUMENTO.length ? 24 : [14, 22, 12, 9, 16, 16, 13, 12][indice],
  }));
  linhasFw17(instrumentos).forEach((linha) => aba.addRow(linha));

  // Cabeçalho distinto por família: cerceta (dados oficiais) × âmbar (SAP).
  const cabecalho = aba.getRow(1);
  cabecalho.height = 22;
  cabecalho.eachCell((celula, coluna) => {
    const ehSap = coluna > ROTULOS_INSTRUMENTO.length;
    celula.font = { bold: true, color: { argb: ehSap ? COR_BASE : COR_OFF } };
    celula.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ehSap ? COR_AMBAR : COR_CERCETA } };
    celula.alignment = { vertical: 'middle', horizontal: 'left' };
  });

  aba.getColumn(5).numFmt = 'dd/mm/yyyy';
  aba.getColumn(6).numFmt = '#,##0.00####';
  aba.getColumn(5).alignment = { horizontal: 'left' };
  // Cabeçalho mantém o alinhamento próprio (a coluna acima não o sobrescreve).
  cabecalho.alignment = { vertical: 'middle', horizontal: 'left' };

  const buffer = await pasta.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

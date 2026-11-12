// Teste da planilha FW17 (sem rede). Execução: npm run testar
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import {
  ROTULOS_INSTRUMENTO,
  ROTULOS_SAP,
  consolidarPorInstrumento,
  derivarDoTicker,
  gerarPlanilhaFw17,
} from '../lib/fw17';
import type { Cotacao } from '../lib/tipos';

assert.deepEqual(derivarDoTicker('DI1F27'), { mercadoria: 'DI1', vencimento: 'F27' });
assert.deepEqual(derivarDoTicker('WINZ26'), { mercadoria: 'WIN', vencimento: 'Z26' });
assert.deepEqual(derivarDoTicker('DOLF27'), { mercadoria: 'DOL', vencimento: 'F27' });
for (const ruim of ['DI1F27F29', 'PETR4', 'DOLA27', '', null, 'DI1F2']) {
  assert.deepEqual(derivarDoTicker(ruim), { mercadoria: '', vencimento: '' }, String(ruim));
}

const base: Cotacao = {
  trade_date: '2026-07-21', ticker: null, instrument_id: null, market: 'BVMF',
  open_interest: null, first_price: null, min_price: null, max_price: null, avg_price: null,
  last_price: null, trades_qty: null, adjusted_quote: null, adjusted_quote_status: null,
  prev_adjusted_quote: null, prev_adjusted_status: null, adjusted_quote_change_pct: null,
  currency: 'BRL',
};
const cotacoes: Cotacao[] = [
  { ...base, ticker: 'DI1F27', instrument_id: '1', adjusted_quote: 98000 },
  { ...base, ticker: 'DI1F27', instrument_id: '1', trade_date: '2026-07-22', adjusted_quote: 98100 },
  { ...base, ticker: 'DI1F27F29', instrument_id: '2' },
];
const ultimo = consolidarPorInstrumento(cotacoes, '2026-07-22');
assert.equal(ultimo.length, 2, 'um instrumento por linha');
assert.equal(ultimo[0].adjusted_quote, 98100);
assert.equal(consolidarPorInstrumento(cotacoes, '2026-07-21')[0].adjusted_quote, 98000);

async function principal() {
  const blob = await gerarPlanilhaFw17(ultimo);
  const pasta = new ExcelJS.Workbook();
  await pasta.xlsx.load(await blob.arrayBuffer());
  const aba = pasta.getWorksheet('FW17')!;
  assert.ok(aba, 'aba FW17');
  assert.equal(aba.rowCount, 3);
  assert.deepEqual(
    (aba.getRow(1).values as string[]).slice(1),
    [...ROTULOS_INSTRUMENTO, ...ROTULOS_SAP],
  );
  assert.equal(aba.views[0].state, 'frozen');
  assert.equal(aba.getRow(2).getCell(7).value, 'DI1');
  assert.equal(aba.getRow(3).getCell(7).value, null, 'spread não deriva');
  for (let c = 9; c <= 13; c++) assert.equal(aba.getRow(2).getCell(c).value, null);

  console.log('✔ Testes da planilha FW17 passaram.');
}

principal().catch((erro) => {
  console.error(erro);
  process.exit(1);
});

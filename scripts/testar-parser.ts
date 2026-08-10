// Teste do pipeline de extração e parse, sem depender da rede.
// Monta um XML no formato BVBG da B3 (BizGrp/Document/PricRpt), empacota em
// ZIP aninhado (ZIP dentro de ZIP, como a B3 publica) e valida o resultado.
//
// Execução: npm run testar

import assert from 'node:assert/strict';
import { strToU8, zipSync } from 'fflate';
import { extrairXmlDoZip, filtrarCotacoes, parsearDerivativos } from '../lib/b3';

const XML_EXEMPLO = `<?xml version="1.0" encoding="UTF-8"?>
<BizFileHdr xmlns="urn:bvmf.052.01.xsd">
  <Xchg>
    <BizGrpDesc>Boletim de Negociação — derivativos</BizGrpDesc>
    <BizGrp>
      <Document xmlns="urn:bvmf.217.01.xsd">
        <PricRpt>
          <TradDt><Dt>2026-07-21</Dt></TradDt>
          <SctyId><TckrSymb>DI1F27</TckrSymb></SctyId>
          <FinInstrmId>
            <OthrId><Id>200001234</Id><Tp><Prtry>8</Prtry></Tp></OthrId>
            <PlcOfListg><MktIdrCd>BVMF</MktIdrCd></PlcOfListg>
          </FinInstrmId>
          <FinInstrmAttrbts>
            <MktDataStrmId>D</MktDataStrmId>
            <OpnIntrst>1500000</OpnIntrst>
            <FrstPric Ccy="BRL">98000.00</FrstPric>
            <MinPric Ccy="BRL">97900.00</MinPric>
            <MaxPric Ccy="BRL">98100.00</MaxPric>
            <TradAvrgPric Ccy="BRL">98010.55</TradAvrgPric>
            <LastPric Ccy="BRL">98050.00</LastPric>
            <RglrTxsQty>3200</RglrTxsQty>
            <AdjstdQt>98055.123</AdjstdQt>
            <AdjstdQtStin>1</AdjstdQtStin>
            <PrvsAdjstdQt>97950.00</PrvsAdjstdQt>
            <PrvsAdjstdQtStin>1</PrvsAdjstdQtStin>
          </FinInstrmAttrbts>
        </PricRpt>
      </Document>
    </BizGrp>
    <BizGrp>
      <Document xmlns="urn:bvmf.217.01.xsd">
        <PricRpt>
          <TradDt><Dt>2026-07-21</Dt></TradDt>
          <SctyId><TckrSymb>DOLQ26</TckrSymb></SctyId>
          <FinInstrmId>
            <OthrId><Id>200005678</Id></OthrId>
            <PlcOfListg><MktIdrCd>BVMF</MktIdrCd></PlcOfListg>
          </FinInstrmId>
          <FinInstrmAttrbts>
            <OpnIntrst>820000</OpnIntrst>
            <FrstPric Ccy="BRL">5432.500</FrstPric>
            <MinPric Ccy="BRL">5420.000</MinPric>
            <MaxPric Ccy="BRL">5450.000</MaxPric>
            <TradAvrgPric Ccy="BRL">5436.789</TradAvrgPric>
            <LastPric Ccy="BRL">5440.000</LastPric>
            <RglrTxsQty>15000</RglrTxsQty>
            <AdjstdQt>5441.234</AdjstdQt>
            <AdjstdQtStin>1</AdjstdQtStin>
            <PrvsAdjstdQt>5450.000</PrvsAdjstdQt>
            <PrvsAdjstdQtStin>1</PrvsAdjstdQtStin>
          </FinInstrmAttrbts>
        </PricRpt>
      </Document>
    </BizGrp>
    <BizGrp>
      <Document xmlns="urn:bvmf.217.01.xsd">
        <PricRpt>
          <TradDt><Dt>2026-07-21</Dt></TradDt>
          <SctyId><TckrSymb>DI1F27F29</TckrSymb></SctyId>
          <FinInstrmId>
            <OthrId><Id>200009999</Id></OthrId>
            <PlcOfListg><MktIdrCd>BVMF</MktIdrCd></PlcOfListg>
          </FinInstrmId>
          <FinInstrmAttrbts>
            <OpnIntrst>500</OpnIntrst>
          </FinInstrmAttrbts>
        </PricRpt>
      </Document>
    </BizGrp>
  </Xchg>
</BizFileHdr>`;

// ZIP aninhado, como a B3 publica: SPRD260721.zip > SPRD260721.zip > *.xml
const zipInterno = zipSync({ 'SPRD260721.xml': strToU8(XML_EXEMPLO) });
const zipExterno = zipSync({ 'SPRD260721.zip': zipInterno });

// --- Extração com ZIP aninhado ---
const xmlExtraido = extrairXmlDoZip(zipExterno);
assert.equal(new TextDecoder().decode(xmlExtraido), XML_EXEMPLO, 'XML extraído difere do original');

// --- Extração com ZIP simples (sem aninhamento) ---
const xmlSimples = extrairXmlDoZip(zipInterno);
assert.equal(new TextDecoder().decode(xmlSimples), XML_EXEMPLO);

// --- Parse ---
const cotacoes = parsearDerivativos(xmlExtraido);
assert.equal(cotacoes.length, 3, `Esperava 3 cotações, obteve ${cotacoes.length}`);

const di1 = cotacoes[0];
assert.equal(di1.ticker, 'DI1F27');
assert.equal(di1.trade_date, '2026-07-21');
assert.equal(di1.instrument_id, '200001234');
assert.equal(di1.market, 'BVMF');
assert.equal(di1.open_interest, 1500000);
assert.equal(di1.first_price, 98000);
assert.equal(di1.min_price, 97900);
assert.equal(di1.max_price, 98100);
assert.equal(di1.avg_price, 98010.55);
assert.equal(di1.last_price, 98050);
assert.equal(di1.trades_qty, 3200);
assert.equal(di1.adjusted_quote, 98055.123);
assert.equal(di1.adjusted_quote_status, '1');
assert.equal(di1.prev_adjusted_quote, 97950);
assert.equal(di1.currency, 'BRL');
assert.ok(
  di1.adjusted_quote_change_pct !== null &&
    Math.abs(di1.adjusted_quote_change_pct - ((98055.123 / 97950 - 1) * 100)) < 1e-9,
  'Variação do ajuste incorreta',
);

// Campos ausentes devem virar null (spread só tem OpnIntrst)
const spread = cotacoes[2];
assert.equal(spread.ticker, 'DI1F27F29');
assert.equal(spread.open_interest, 500);
assert.equal(spread.adjusted_quote, null);
assert.equal(spread.currency, null);

// --- Filtros ---
assert.equal(filtrarCotacoes(cotacoes, [], false).length, 3, 'Sem filtro deve devolver tudo');
assert.equal(filtrarCotacoes(cotacoes, ['DI1'], false).length, 2, 'Prefixo DI1 pega contrato e spread');
assert.equal(filtrarCotacoes(cotacoes, ['DI1'], true).length, 1, 'DI1 + 6 caracteres exclui o spread');
assert.equal(filtrarCotacoes(cotacoes, ['DI1', 'DOL'], true).length, 2);
assert.equal(filtrarCotacoes(cotacoes, ['WIN'], false).length, 0);

console.log('✔ Todos os testes do parser passaram.');
console.log(`  - ${cotacoes.length} cotações parseadas do XML de exemplo (ZIP aninhado tratado)`);
console.log(`  - Exemplo: ${di1.ticker} ajuste=${di1.adjusted_quote} (${di1.currency})`);

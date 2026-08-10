// API de cotações de derivativos da B3.
//
// GET /api/cotacoes?data=2026-07-01&tipo=SPRD&prefixos=DI1,DOL&somente6=1&formato=csv
//   - data      (obrigatório): dia do pregão no formato AAAA-MM-DD
//   - tipo      (opcional): tipo do arquivo da Pesquisa por Pregão (padrão: SPRD)
//   - prefixos  (opcional): lista separada por vírgula; vazio retorna TODAS as cotações
//   - somente6  (opcional): "1" mantém apenas tickers de 6 caracteres (contratos padrão)
//   - formato   (opcional): "csv" devolve o arquivo CSV em vez de JSON

import { NextRequest, NextResponse } from 'next/server';
import { buscarDerivativosB3, filtrarCotacoes, ErroB3 } from '../../../lib/b3';
import { gerarCsv } from '../../../lib/tipos';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
export const preferredRegion = 'gru1'; // São Paulo, mais próximo da B3

// Dados de pregões passados são imutáveis: cache agressivo na CDN da Vercel.
const CABECALHO_CACHE = 'public, s-maxage=86400, stale-while-revalidate=604800';

export async function GET(requisicao: NextRequest) {
  const parametros = requisicao.nextUrl.searchParams;
  const data = (parametros.get('data') ?? '').trim();
  const tipo = (parametros.get('tipo') ?? 'SPRD').trim().toUpperCase();
  const prefixos = (parametros.get('prefixos') ?? '')
    .split(',')
    .map((prefixo) => prefixo.trim().toUpperCase())
    .filter(Boolean);
  const somenteSeisCaracteres = parametros.get('somente6') === '1';
  const formato = (parametros.get('formato') ?? 'json').toLowerCase();

  try {
    const { arquivo, cotacoes } = await buscarDerivativosB3(tipo, data);
    const filtradas = filtrarCotacoes(cotacoes, prefixos, somenteSeisCaracteres);

    if (formato === 'csv') {
      return new NextResponse(gerarCsv(filtradas), {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="cotacoes_${tipo}_${data}.csv"`,
          'Cache-Control': CABECALHO_CACHE,
        },
      });
    }

    return NextResponse.json(
      {
        arquivo,
        data,
        tipo,
        prefixos,
        somente6: somenteSeisCaracteres,
        total: filtradas.length,
        total_no_arquivo: cotacoes.length,
        cotacoes: filtradas,
      },
      { headers: { 'Cache-Control': CABECALHO_CACHE } },
    );
  } catch (erro) {
    const status = erro instanceof ErroB3 ? erro.status : 500;
    const mensagem =
      erro instanceof Error ? erro.message : 'Ocorreu um erro inesperado ao processar o pedido.';
    return NextResponse.json({ erro: mensagem }, { status });
  }
}

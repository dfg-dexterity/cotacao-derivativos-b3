// Download e processamento dos arquivos de derivativos da B3 (Pesquisa por Pregão).
// Porta em TypeScript da lógica do script Python de referência: baixa o ZIP,
// trata ZIP aninhado (ZIP dentro de ZIP), parseia o XML BVBG/PricRpt e devolve
// as cotações de todos os instrumentos.

import { unzipSync } from 'fflate';
import { XMLParser } from 'fast-xml-parser';
import type { Cotacao } from './tipos';

export class ErroB3 extends Error {
  constructor(mensagem: string, public readonly status: number) {
    super(mensagem);
    this.name = 'ErroB3';
  }
}

const CABECALHOS_HTTP = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  Accept: '*/*',
};

// ==========================================
// EXTRAÇÃO DO ZIP (com suporte a ZIP aninhado)
// ==========================================
export function extrairXmlDoZip(conteudoZip: Uint8Array): Uint8Array {
  let arquivos: Record<string, Uint8Array>;
  try {
    arquivos = unzipSync(conteudoZip);
  } catch {
    throw new ErroB3('O conteúdo baixado da B3 não é um ZIP válido.', 502);
  }

  const nomes = Object.keys(arquivos).filter((nome) => !nome.endsWith('/'));

  // Se contém outro ZIP dentro, abrir recursivamente
  const zipInterno = nomes.find((nome) => nome.toLowerCase().endsWith('.zip'));
  if (zipInterno) {
    return extrairXmlDoZip(arquivos[zipInterno]);
  }

  const xml = nomes.find((nome) => nome.toLowerCase().endsWith('.xml'));
  if (xml) {
    return arquivos[xml];
  }

  throw new ErroB3(
    `Nenhum XML encontrado no ZIP da B3. Conteúdo: ${nomes.join(', ') || '(vazio)'}`,
    404,
  );
}

function decodificarXml(bytes: Uint8Array): string {
  // A declaração XML fica nos primeiros bytes; usa latin1 para lê-la com segurança.
  const cabecalho = new TextDecoder('latin1').decode(bytes.subarray(0, 200));
  const encontrado = cabecalho.match(/encoding\s*=\s*["']([^"']+)["']/i);
  const codificacao = (encontrado?.[1] ?? 'utf-8').toLowerCase();
  try {
    return new TextDecoder(codificacao).decode(bytes);
  } catch {
    return new TextDecoder('utf-8').decode(bytes);
  }
}

// ==========================================
// PARSE DO XML (BVBG — PricRpt)
// ==========================================
type NoXml = Record<string, unknown>;

const primeiro = (valor: unknown): unknown => (Array.isArray(valor) ? valor[0] : valor);

function texto(no: unknown): string | null {
  const valor = primeiro(no);
  if (valor === undefined || valor === null) return null;
  if (typeof valor === 'object') {
    const interno = (valor as NoXml)['#text'];
    return interno === undefined || interno === null ? null : String(interno).trim();
  }
  const resultado = String(valor).trim();
  return resultado === '' ? null : resultado;
}

function numero(no: unknown): number | null {
  const valorTexto = texto(no);
  if (valorTexto === null) return null;
  const valor = Number(valorTexto);
  return Number.isFinite(valor) ? valor : null;
}

function atributo(no: unknown, nome: string): string | null {
  const valor = primeiro(no);
  if (valor && typeof valor === 'object') {
    const atrib = (valor as NoXml)[`@_${nome}`];
    return atrib === undefined || atrib === null ? null : String(atrib);
  }
  return null;
}

// Percorre a árvore inteira coletando todos os nós <PricRpt>, independentemente
// de namespace ou de onde estejam (equivale ao .//pric:PricRpt do ElementTree).
function coletarPricRpts(no: unknown, saida: NoXml[]): void {
  if (Array.isArray(no)) {
    for (const item of no) coletarPricRpts(item, saida);
    return;
  }
  if (no === null || typeof no !== 'object') return;
  for (const [chave, valor] of Object.entries(no as NoXml)) {
    if (chave === 'PricRpt') {
      if (Array.isArray(valor)) saida.push(...(valor as NoXml[]));
      else if (valor && typeof valor === 'object') saida.push(valor as NoXml);
    } else {
      coletarPricRpts(valor, saida);
    }
  }
}

export function parsearDerivativos(xmlBytes: Uint8Array): Cotacao[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    removeNSPrefix: true,
    parseTagValue: false,
    parseAttributeValue: false,
    trimValues: true,
  });

  let raiz: unknown;
  try {
    raiz = parser.parse(decodificarXml(xmlBytes));
  } catch {
    throw new ErroB3('Falha ao parsear o XML retornado pela B3.', 502);
  }

  const relatorios: NoXml[] = [];
  coletarPricRpts(raiz, relatorios);

  return relatorios.map((rpt) => {
    const tradDt = primeiro(rpt['TradDt']) as NoXml | undefined;
    const sctyId = primeiro(rpt['SctyId']) as NoXml | undefined;
    const finInstrmId = primeiro(rpt['FinInstrmId']) as NoXml | undefined;
    const othrId = primeiro(finInstrmId?.['OthrId']) as NoXml | undefined;
    const plcOfListg = primeiro(finInstrmId?.['PlcOfListg']) as NoXml | undefined;
    const attrs = primeiro(rpt['FinInstrmAttrbts']) as NoXml | undefined;

    const ajuste = numero(attrs?.['AdjstdQt']);
    const ajusteAnterior = numero(attrs?.['PrvsAdjstdQt']);
    const variacao =
      ajuste !== null && ajusteAnterior !== null && ajusteAnterior !== 0
        ? (ajuste / ajusteAnterior - 1) * 100
        : null;

    const cotacao: Cotacao = {
      trade_date: texto(tradDt?.['Dt']),
      ticker: texto(sctyId?.['TckrSymb']),
      instrument_id: texto(othrId?.['Id']),
      market: texto(plcOfListg?.['MktIdrCd']),
      open_interest: numero(attrs?.['OpnIntrst']),
      first_price: numero(attrs?.['FrstPric']),
      min_price: numero(attrs?.['MinPric']),
      max_price: numero(attrs?.['MaxPric']),
      avg_price: numero(attrs?.['TradAvrgPric']),
      last_price: numero(attrs?.['LastPric']),
      trades_qty: numero(attrs?.['RglrTxsQty']),
      adjusted_quote: ajuste,
      adjusted_quote_status: texto(attrs?.['AdjstdQtStin']),
      prev_adjusted_quote: ajusteAnterior,
      prev_adjusted_status: texto(attrs?.['PrvsAdjstdQtStin']),
      adjusted_quote_change_pct: variacao,
      // A moeda vem como atributo Ccy do elemento FrstPric
      currency: atributo(attrs?.['FrstPric'], 'Ccy'),
    };
    return cotacao;
  });
}

// ==========================================
// FILTROS
// ==========================================
export function filtrarCotacoes(
  cotacoes: Cotacao[],
  prefixos: string[],
  somenteSeisCaracteres: boolean,
): Cotacao[] {
  let resultado = cotacoes;
  if (prefixos.length > 0) {
    resultado = resultado.filter(
      (cotacao) =>
        cotacao.ticker !== null &&
        prefixos.some((prefixo) => cotacao.ticker!.startsWith(prefixo)),
    );
  }
  if (somenteSeisCaracteres) {
    resultado = resultado.filter((cotacao) => (cotacao.ticker ?? '').length === 6);
  }
  return resultado;
}

// ==========================================
// DOWNLOAD NA B3
// ==========================================
export interface ResultadoBusca {
  arquivo: string;
  cotacoes: Cotacao[];
}

export async function buscarDerivativosB3(
  tipoArquivo: string,
  dataISO: string,
): Promise<ResultadoBusca> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataISO)) {
    throw new ErroB3('Data inválida. Use o formato AAAA-MM-DD.', 400);
  }
  if (!/^[A-Z0-9]{1,10}$/.test(tipoArquivo)) {
    throw new ErroB3('Tipo de arquivo inválido. Use apenas letras e números (ex.: SPRD, PR).', 400);
  }

  const aammdd = dataISO.slice(2).replace(/-/g, '');
  const nomeArquivo = `${tipoArquivo}${aammdd}.zip`;
  const url = `https://www.b3.com.br/pesquisapregao/download?filelist=${nomeArquivo},`;

  let resposta: Response;
  try {
    resposta = await fetch(url, {
      headers: CABECALHOS_HTTP,
      cache: 'no-store',
      signal: AbortSignal.timeout(50_000),
    });
  } catch (erro) {
    const timeout = erro instanceof Error && erro.name === 'TimeoutError';
    throw new ErroB3(
      timeout
        ? 'Tempo esgotado ao baixar o arquivo da B3. Tente novamente em instantes.'
        : 'Não foi possível conectar ao site da B3. Tente novamente em instantes.',
      504,
    );
  }

  if (!resposta.ok) {
    throw new ErroB3(
      `A B3 respondeu com status ${resposta.status} ao baixar ${nomeArquivo}. ` +
        'Verifique se a data é um dia útil e se o arquivo já foi publicado.',
      502,
    );
  }

  const corpo = new Uint8Array(await resposta.arrayBuffer());

  // Todo ZIP começa com a assinatura "PK". Qualquer outra coisa (HTML, vazio)
  // indica que o arquivo não está disponível para a data solicitada.
  if (corpo.length < 4 || corpo[0] !== 0x50 || corpo[1] !== 0x4b) {
    throw new ErroB3(
      `O arquivo ${nomeArquivo} não está disponível na B3. ` +
        'Verifique se a data é um dia útil e se o pregão já foi publicado (normalmente após o fechamento).',
      404,
    );
  }

  const xmlBytes = extrairXmlDoZip(corpo);
  const cotacoes = parsearDerivativos(xmlBytes);
  return { arquivo: nomeArquivo, cotacoes };
}

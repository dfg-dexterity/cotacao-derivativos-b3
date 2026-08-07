'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  COLUNAS,
  PREFIXOS_SUGERIDOS,
  gerarCsv,
  type ChaveColuna,
  type Coluna,
  type Cotacao,
} from '../lib/tipos';

interface RespostaApi {
  arquivo: string;
  data: string;
  tipo: string;
  total: number;
  total_no_arquivo: number;
  cotacoes: Cotacao[];
}

const LINHAS_POR_PAGINA = 100;

const formatadorInteiro = new Intl.NumberFormat('pt-BR');
const formatadorPreco = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
});

function ultimaDataUtil(): string {
  const data = new Date();
  data.setDate(data.getDate() - 1);
  while (data.getDay() === 0 || data.getDay() === 6) {
    data.setDate(data.getDate() - 1);
  }
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function formatarData(iso: string): string {
  const [ano, mes, dia] = iso.split('-');
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : iso;
}

export default function Pagina() {
  const [dataPregao, setDataPregao] = useState('');
  const [tipo, setTipo] = useState('SPRD');
  const [prefixos, setPrefixos] = useState('');
  const [somenteSeis, setSomenteSeis] = useState(false);

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<RespostaApi | null>(null);

  const [busca, setBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState<{ coluna: ChaveColuna; direcao: 1 | -1 } | null>(null);
  const [pagina, setPagina] = useState(1);

  // Modo de incorporação (iframe no Odoo, Notion, intranet): layout compacto,
  // sem faixa de título nem rodapé, com a consulta já disparada no carregamento.
  const [embutido, setEmbutido] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(true);

  // Lido no cliente: evita divergência de fuso e de query string na hidratação.
  useEffect(() => {
    const parametros = new URLSearchParams(window.location.search);
    const modoEmbutido = parametros.get('embed') === '1';
    const tipoUrl = (parametros.get('tipo') ?? '').toUpperCase();
    const dataUrl = parametros.get('data') ?? '';
    const prefixosUrl = (parametros.get('prefixos') ?? '')
      .split(',')
      .map((prefixo) => prefixo.trim().toUpperCase())
      .filter(Boolean);
    const somenteSeisUrl = parametros.get('somente6') === '1';
    const dataEscolhida = /^\d{4}-\d{2}-\d{2}$/.test(dataUrl) ? dataUrl : ultimaDataUtil();
    const tipoEscolhido = tipoUrl === 'PR' || tipoUrl === 'SPRD' ? tipoUrl : 'SPRD';

    setEmbutido(modoEmbutido);
    setMostrarFiltros(parametros.get('filtros') !== '0');
    setDataPregao(dataEscolhida);
    setTipo(tipoEscolhido);
    if (prefixosUrl.length > 0) setPrefixos(prefixosUrl.join(', '));
    setSomenteSeis(somenteSeisUrl);
    document.body.classList.toggle('modo-embutido', modoEmbutido);

    if (modoEmbutido || parametros.get('auto') === '1') {
      void executarBusca({
        data: dataEscolhida,
        tipo: tipoEscolhido,
        prefixos: prefixosUrl,
        somenteSeis: somenteSeisUrl,
      });
    }
    // Executa uma única vez, na montagem.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prefixosAtivos = useMemo(
    () =>
      prefixos
        .split(',')
        .map((prefixo) => prefixo.trim().toUpperCase())
        .filter(Boolean),
    [prefixos],
  );

  function alternarPrefixo(prefixo: string) {
    const novos = prefixosAtivos.includes(prefixo)
      ? prefixosAtivos.filter((atual) => atual !== prefixo)
      : [...prefixosAtivos, prefixo];
    setPrefixos(novos.join(', '));
  }

  async function executarBusca(opcoes: {
    data: string;
    tipo: string;
    prefixos: string[];
    somenteSeis: boolean;
  }) {
    if (!opcoes.data) {
      setErro('Escolha a data do pregão.');
      return;
    }
    setCarregando(true);
    setErro(null);
    try {
      const parametros = new URLSearchParams({ data: opcoes.data, tipo: opcoes.tipo });
      if (opcoes.prefixos.length > 0) parametros.set('prefixos', opcoes.prefixos.join(','));
      if (opcoes.somenteSeis) parametros.set('somente6', '1');

      const resposta = await fetch(`/api/cotacoes?${parametros.toString()}`);
      const corpo = await resposta.json();
      if (!resposta.ok) {
        throw new Error(corpo?.erro ?? `A consulta falhou (HTTP ${resposta.status}).`);
      }
      setResultado(corpo as RespostaApi);
      setBusca('');
      setPagina(1);
    } catch (excecao) {
      setResultado(null);
      setErro(excecao instanceof Error ? excecao.message : 'Ocorreu um erro inesperado.');
    } finally {
      setCarregando(false);
    }
  }

  function buscar(evento?: FormEvent) {
    evento?.preventDefault();
    void executarBusca({
      data: dataPregao,
      tipo,
      prefixos: prefixosAtivos,
      somenteSeis,
    });
  }

  const linhas = useMemo(() => {
    if (!resultado) return [];
    let lista = resultado.cotacoes;
    const termo = busca.trim().toUpperCase();
    if (termo) {
      lista = lista.filter((cotacao) => (cotacao.ticker ?? '').toUpperCase().includes(termo));
    }
    if (ordenacao) {
      const { coluna, direcao } = ordenacao;
      lista = [...lista].sort((a, b) => {
        const valorA = a[coluna];
        const valorB = b[coluna];
        if (valorA === null || valorA === undefined) return 1;
        if (valorB === null || valorB === undefined) return -1;
        if (typeof valorA === 'number' && typeof valorB === 'number') {
          return (valorA - valorB) * direcao;
        }
        return String(valorA).localeCompare(String(valorB), 'pt-BR') * direcao;
      });
    }
    return lista;
  }, [resultado, busca, ordenacao]);

  const totalPaginas = Math.max(1, Math.ceil(linhas.length / LINHAS_POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const linhasDaPagina = linhas.slice(
    (paginaAtual - 1) * LINHAS_POR_PAGINA,
    paginaAtual * LINHAS_POR_PAGINA,
  );

  function ordenarPor(coluna: ChaveColuna) {
    setPagina(1);
    setOrdenacao((atual) =>
      atual?.coluna === coluna
        ? { coluna, direcao: atual.direcao === 1 ? -1 : 1 }
        : { coluna, direcao: 1 },
    );
  }

  function baixarCsv() {
    if (!resultado) return;
    const blob = new Blob([gerarCsv(linhas)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const ancora = document.createElement('a');
    ancora.href = url;
    ancora.download = `cotacoes_${resultado.tipo}_${resultado.data}.csv`;
    ancora.click();
    URL.revokeObjectURL(url);
  }

  function renderizarValor(cotacao: Cotacao, coluna: Coluna) {
    const valor = cotacao[coluna.chave];
    if (valor === null || valor === undefined || valor === '') {
      return <span className="vazio">—</span>;
    }
    switch (coluna.tipo) {
      case 'data':
        return formatarData(String(valor));
      case 'inteiro':
        return formatadorInteiro.format(Number(valor));
      case 'preco': {
        const numero = Number(valor);
        const texto = formatadorPreco.format(numero);
        if (coluna.chave === 'adjusted_quote_change_pct') {
          const classe = numero > 0 ? 'positivo' : numero < 0 ? 'negativo' : '';
          return <span className={classe}>{texto}</span>;
        }
        return texto;
      }
      default:
        return String(valor);
    }
  }

  const urlJson = resultado
    ? `/api/cotacoes?data=${resultado.data}&tipo=${resultado.tipo}` +
      (prefixosAtivos.length > 0 ? `&prefixos=${prefixosAtivos.join(',')}` : '') +
      (somenteSeis ? '&somente6=1' : '')
    : null;

  return (
    <>
      <div className="barra-topo">
        <div className="container barra-topo-conteudo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-dexterity.png" alt="Dexterity Solutions" className="logo-dexterity" />
          <span className="rotulo-ferramenta">
            {embutido ? 'Cotações de Derivativos — B3' : 'Dados de Mercado'}
          </span>
        </div>
      </div>

      {!embutido && (
        <header className="topo">
          <div className="container">
            <h1>Cotações de Derivativos — B3</h1>
            <p>
              Ajustes e cotações dos contratos futuros, direto dos arquivos oficiais da{' '}
              <strong>Pesquisa por Pregão</strong> da B3.
            </p>
          </div>
        </header>
      )}

      <main className="container">
        {mostrarFiltros && (
        <section className="cartao">
          <form onSubmit={buscar} className="formulario">
            <div className="campo">
              <label htmlFor="data">Data do pregão</label>
              <input
                id="data"
                type="date"
                value={dataPregao}
                onChange={(evento) => setDataPregao(evento.target.value)}
                required
              />
            </div>

            <div className="campo">
              <label htmlFor="tipo">Arquivo</label>
              <select id="tipo" value={tipo} onChange={(evento) => setTipo(evento.target.value)}>
                <option value="SPRD">SPRD — Derivativos (ajustes do pregão)</option>
                <option value="PR">PR — Price Report completo (arquivo grande)</option>
              </select>
            </div>

            <div className="campo campo-prefixos">
              <label htmlFor="prefixos">Prefixos de ticker (vazio = todas as cotações)</label>
              <input
                id="prefixos"
                type="text"
                placeholder="Ex.: DI1, DOL, WIN"
                value={prefixos}
                onChange={(evento) => setPrefixos(evento.target.value)}
              />
            </div>

            <div className="campo campo-acao">
              <button type="submit" disabled={carregando}>
                {carregando ? 'Consultando…' : 'Buscar cotações'}
              </button>
            </div>
          </form>

          <div className="chips" role="group" aria-label="Atalhos de prefixo">
            {PREFIXOS_SUGERIDOS.map((prefixo) => (
              <button
                key={prefixo}
                type="button"
                className={`chip ${prefixosAtivos.includes(prefixo) ? 'ativo' : ''}`}
                onClick={() => alternarPrefixo(prefixo)}
              >
                {prefixo}
              </button>
            ))}
            <label className="opcao-seis">
              <input
                type="checkbox"
                checked={somenteSeis}
                onChange={(evento) => setSomenteSeis(evento.target.checked)}
              />
              Somente tickers de 6 caracteres (contratos padrão)
            </label>
          </div>

          <p className="dica">
            Os arquivos são publicados pela B3 apenas em dias úteis, normalmente após o fechamento
            do pregão.
          </p>
        </section>
        )}

        {carregando && (
          <section className="cartao aviso-carregando">
            <span className="girador" aria-hidden="true" />
            Baixando e processando o arquivo da B3 — isso pode levar até um minuto…
          </section>
        )}

        {erro && !carregando && (
          <section className="cartao alerta-erro" role="alert">
            <strong>Não foi possível concluir a consulta.</strong>
            <span>{erro}</span>
          </section>
        )}

        {resultado && !carregando && (
          <section className="cartao resultados">
            <div className="barra-resultados">
              <div className="resumo">
                <strong>{formatadorInteiro.format(resultado.total)}</strong> cotações
                {resultado.total !== resultado.total_no_arquivo && (
                  <>
                    {' '}
                    (de {formatadorInteiro.format(resultado.total_no_arquivo)} no arquivo)
                  </>
                )}
                {' — '}
                <code>{resultado.arquivo}</code>
              </div>
              <div className="acoes">
                <input
                  type="search"
                  placeholder="Filtrar ticker…"
                  value={busca}
                  onChange={(evento) => {
                    setBusca(evento.target.value);
                    setPagina(1);
                  }}
                  aria-label="Filtrar por ticker"
                />
                <button type="button" onClick={baixarCsv} disabled={linhas.length === 0}>
                  Baixar CSV
                </button>
                {urlJson && (
                  <a className="ligacao-json" href={urlJson} target="_blank" rel="noreferrer">
                    Ver JSON
                  </a>
                )}
              </div>
            </div>

            {linhas.length === 0 ? (
              <p className="sem-registros">Nenhuma cotação encontrada com os filtros atuais.</p>
            ) : (
              <>
                <div className="tabela-rolagem">
                  <table>
                    <thead>
                      <tr>
                        {COLUNAS.map((coluna) => (
                          <th
                            key={coluna.chave}
                            className={coluna.tipo === 'texto' || coluna.tipo === 'data' ? '' : 'numerica'}
                            onClick={() => ordenarPor(coluna.chave)}
                            title="Clique para ordenar"
                          >
                            {coluna.rotulo}
                            {ordenacao?.coluna === coluna.chave && (
                              <span className="seta">{ordenacao.direcao === 1 ? ' ▲' : ' ▼'}</span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {linhasDaPagina.map((cotacao, indice) => (
                        <tr key={`${cotacao.ticker}-${cotacao.instrument_id}-${indice}`}>
                          {COLUNAS.map((coluna) => (
                            <td
                              key={coluna.chave}
                              className={
                                coluna.tipo === 'texto' || coluna.tipo === 'data' ? '' : 'numerica'
                              }
                            >
                              {renderizarValor(cotacao, coluna)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPaginas > 1 && (
                  <div className="paginacao">
                    <button type="button" onClick={() => setPagina(1)} disabled={paginaAtual === 1}>
                      «
                    </button>
                    <button
                      type="button"
                      onClick={() => setPagina(paginaAtual - 1)}
                      disabled={paginaAtual === 1}
                    >
                      ‹
                    </button>
                    <span>
                      Página {paginaAtual} de {totalPaginas}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPagina(paginaAtual + 1)}
                      disabled={paginaAtual === totalPaginas}
                    >
                      ›
                    </button>
                    <button
                      type="button"
                      onClick={() => setPagina(totalPaginas)}
                      disabled={paginaAtual === totalPaginas}
                    >
                      »
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {!resultado && !carregando && !erro && (
          <section className="cartao vazio-inicial">
            <p>
              Escolha a data do pregão e clique em <strong>Buscar cotações</strong>. Sem prefixos,
              todas as cotações do arquivo são retornadas.
            </p>
          </section>
        )}
      </main>

      {!embutido && (
        <footer className="rodape">
          <div className="container rodape-conteudo">
            <div className="marca-rodape">
              DEXTER<span>IT</span>Y<small>SOLUTIONS</small>
            </div>
            <p>
              Aplicativo não oficial. Dados públicos da B3 (Pesquisa por Pregão) — confira sempre as
              fontes oficiais antes de decisões de investimento.
            </p>
          </div>
        </footer>
      )}
    </>
  );
}

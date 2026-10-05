import { DexterityLogo } from './DexterityLogo';

/*
 * Casca padrão das ferramentas de Dados de Mercado: barra de marca e rodapé,
 * com a mesma marcação dos apps estáticos (taxas-indices, bndes-um,
 * calculadoramtmdexterity, cotacaodemoedas). Todo o visual vem das classes
 * dxt-* de app/dexterity.css — não acrescente estilo de casca no globals.css.
 * A faixa de título (dxt-pagehead) fica em page.tsx, junto do conteúdo.
 */

export function BarraDeMarca() {
  return (
    <div className="dxt-topbar">
      <div className="dxt-topbar-inner">
        <a href="https://www.dexterityit.com.br" aria-label="Dexterity IT Solutions — ir para o site">
          <DexterityLogo />
        </a>
        <div className="dxt-topbar-right">
          <nav className="dxt-nav" aria-label="Navegação principal">
            <a href="https://www.dexterityit.com.br/ferramentas">Todas as ferramentas</a>
          </nav>
        </div>
      </div>
    </div>
  );
}

/*
 * A coluna "Ferramentas" é idêntica nas cinco ferramentas de Dados de Mercado
 * (calculadoramtmdexterity, cotacao-derivativos-b3, taxas-indices, bndes-um e
 * cotacaodemoedas): ao incluir ou renomear uma ferramenta, atualize nas cinco.
 * Endereços sempre no domínio da Dexterity, nunca *.vercel.app. Na ferramenta
 * atual, o link leva aria-current="page".
 */
export function Rodape() {
  return (
    <footer className="dxt-footer">
      <div className="dxt-footer-inner">
        <div className="dxt-footer-brand">
          <a href="https://www.dexterityit.com.br" aria-label="Dexterity IT Solutions — ir para o site">
            <DexterityLogo />
          </a>
          <p>Consultoria SAP especializada em Tesouraria e Risco.</p>
          <address>
            Rua Visconde do Rio Branco, 1488 — Conj. 909
            <br />
            Centro · Curitiba · PR
            <br />
            CEP 80420-210
          </address>
        </div>

        <div>
          <h4 className="dxt-eyebrow dxt-eyebrow-muted">Ferramentas</h4>
          <ul>
            <li><a href="https://www.dexterityit.com.br/calculadora-mtm-ndf">Calculadora MTM</a></li>
            <li><a href="https://www.dexterityit.com.br/derivativos-listados-b3" aria-current="page">Derivativos Listados B3</a></li>
            <li><a href="https://www.dexterityit.com.br/indicadores-economicos">Indicadores Econômicos</a></li>
            <li><a href="https://www.dexterityit.com.br/moedas-bndes">Moedas BNDES</a></li>
            <li><a href="https://www.dexterityit.com.br/cotacao-de-moedas">Cotação de Moedas</a></li>
            <li><a href="https://www.dexterityit.com.br/calculadora-cdb">Calculadora CDB</a></li>
            <li><a href="https://www.dexterityit.com.br/titulos-publicos">Títulos Públicos</a></li>
            <li><a href="https://www.dexterityit.com.br/ferramentas">Todas as ferramentas &rarr;</a></li>
          </ul>
        </div>

        <div>
          <h4 className="dxt-eyebrow dxt-eyebrow-muted">Empresa</h4>
          <ul>
            <li><a href="https://www.dexterityit.com.br/solucoes">Soluções</a></li>
            <li><a href="https://www.dexterityit.com.br/cursos">Cursos</a></li>
            <li><a href="https://www.dexterityit.com.br/experiencia">Experiência</a></li>
            <li><a href="https://www.dexterityit.com.br/contato">Falar com a gente</a></li>
          </ul>
        </div>
      </div>

      <div className="dxt-footer-nota">
        <div>
          <p>
            Aplicativo não oficial. Dados públicos da B3 (Pesquisa por Pregão) — confira sempre as
            fontes oficiais antes de decisões de investimento.
          </p>
        </div>
      </div>
    </footer>
  );
}

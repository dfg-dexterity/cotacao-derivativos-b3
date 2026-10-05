import type { Metadata, Viewport } from 'next';
// Ordem importa: primeiro a folha compartilhada da marca (cópia byte a byte,
// não editar aqui), depois os estilos próprios desta ferramenta.
import './dexterity.css';
import './globals.css';
import { BarraDeMarca, Rodape } from './Casca';

// Endereço canônico: a página do site que apresenta a ferramenta (MK-02-004).
// O *.vercel.app só aparece no src do iframe dessa página (site/).
const PAGINA_DO_SITE = 'https://www.dexterityit.com.br/derivativos-listados-b3';
const NOME = 'Derivativos Listados B3';
const TITULO = 'Derivativos listados B3: ajustes e cotações de futuros';
const DESCRICAO =
  'Ajustes e cotações de todos os contratos futuros da B3 (DI1, DOL, WIN, IND e mais), direto da Pesquisa por Pregão, com filtros e exportação em CSV para Excel.';

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  alternates: { canonical: PAGINA_DO_SITE },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Dexterity IT Solutions',
    title: TITULO,
    description: DESCRICAO,
    url: PAGINA_DO_SITE,
  },
  twitter: {
    card: 'summary',
    title: TITULO,
    description: DESCRICAO,
  },
};

export const viewport: Viewport = {
  themeColor: '#1B1B1B',
};

// Dados estruturados (padrão MK-02-003). Sem FAQPage: a tela do app não mostra
// perguntas frequentes — elas ficam na página do site (site/).
const DADOS_ESTRUTURADOS = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': `${PAGINA_DO_SITE}#ferramenta`,
      name: NOME,
      alternateName: 'Cotações de Derivativos B3',
      url: PAGINA_DO_SITE,
      description:
        'Ajuste do dia e cotações (abertura, mínimo, máximo, médio, último, negócios e contratos em aberto) de todos os contratos futuros listados na B3, lidos dos arquivos oficiais da Pesquisa por Pregão, com filtro por ticker e exportação em CSV.',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
      publisher: {
        '@type': 'ProfessionalService',
        '@id': 'https://www.dexterityit.com.br/#organizacao',
        name: 'Dexterity IT Solutions',
        url: 'https://www.dexterityit.com.br',
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://www.dexterityit.com.br/' },
        { '@type': 'ListItem', position: 2, name: 'Ferramentas', item: 'https://www.dexterityit.com.br/ferramentas' },
        { '@type': 'ListItem', position: 3, name: NOME, item: PAGINA_DO_SITE },
      ],
    },
  ],
};

/*
 * Modo incorporado (?embed=1, iframe do site): a classe vai no <html> antes da
 * primeira pintura, e o dexterity.css esconde o título da faixa e as colunas do
 * rodapé, compacta a barra e usa a largura toda. Como o script altera o <html>
 * antes da hidratação, o elemento leva suppressHydrationWarning.
 */
const SCRIPT_MODO_EMBUTIDO =
  'if (new URLSearchParams(location.search).get("embed") === "1") document.documentElement.classList.add("modo-embutido");';

/*
 * As fontes da marca (Barlow Condensed nos títulos, Figtree no texto e IBM Plex
 * Mono em rótulos e números) vêm do Google Fonts, como nas demais ferramentas.
 * O tema é escuro único — daí a classe `dark` fixa no <html>.
 */
export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_MODO_EMBUTIDO }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700&family=Figtree:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(DADOS_ESTRUTURADOS).replace(/</g, '\\u003c'),
          }}
        />
      </head>
      <body>
        <BarraDeMarca />
        {children}
        <Rodape />
      </body>
    </html>
  );
}

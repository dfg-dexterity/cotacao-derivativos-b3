import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cotações de Derivativos — B3 | Dexterity IT Solutions',
  description:
    'Consulta de ajustes e cotações dos contratos futuros da B3, direto dos arquivos oficiais da Pesquisa por Pregão.',
};

export const viewport: Viewport = {
  themeColor: '#1B1B1B',
};

/*
 * As fontes da marca (Barlow Condensed nos títulos, Figtree no texto e IBM Plex
 * Mono em rótulos e números) vêm do Google Fonts, como nas demais ferramentas.
 * O tema é escuro único — daí a classe `dark` fixa no <html>.
 */
export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700&family=Figtree:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

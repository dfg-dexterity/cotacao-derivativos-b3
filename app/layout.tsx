import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cotações de Derivativos — B3 | Dexterity IT Solutions',
  description:
    'Consulta de ajustes e cotações dos contratos futuros da B3, direto dos arquivos oficiais da Pesquisa por Pregão.',
};

export const viewport = {
  themeColor: '#1b1b1b',
  colorScheme: 'dark',
};

export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Fontes da marca. Carregadas por <link> (e não por next/font) para que
            `dexterity.css` continue portátil: o mesmo par de arquivos é colado
            em projetos sem build, como o site em Odoo. */}
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

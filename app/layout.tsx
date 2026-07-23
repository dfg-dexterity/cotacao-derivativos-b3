import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cotações de Derivativos — B3',
  description:
    'Consulta de ajustes e cotações dos contratos futuros da B3, direto dos arquivos oficiais da Pesquisa por Pregão.',
};

export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:caminho*',
        headers: [
          // Página pública e somente-leitura, feita para ser embutida em iframe
          // (Odoo, Notion, intranet). Sem frame-ancestors liberado o navegador
          // recusa o embed. Para restringir a um domínio, troque o `*` por ele:
          // "frame-ancestors https://empresa.odoo.com".
          { key: 'Content-Security-Policy', value: 'frame-ancestors *' },
        ],
      },
    ];
  },
};

export default nextConfig;

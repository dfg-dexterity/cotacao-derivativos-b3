/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:caminho*',
        headers: [
          // Página pública e somente-leitura, feita para ser embutida em iframe
          // (página do site no Odoo, Notion, intranet). Sem frame-ancestors
          // liberado o navegador recusa o embed. Para restringir a um domínio,
          // troque o `*` por ele: "frame-ancestors https://www.dexterityit.com.br".
          { key: 'Content-Security-Policy', value: 'frame-ancestors *' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      {
        // A API devolve JSON/CSV: não deve aparecer em buscadores.
        source: '/api/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
      },
    ];
  },
};

export default nextConfig;

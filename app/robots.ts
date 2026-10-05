import type { MetadataRoute } from 'next';

// robots.txt da aplicação: tudo liberado, menos a API (JSON/CSV não é página).
// O endereço canônico desta ferramenta é a página do site,
// https://www.dexterityit.com.br/derivativos-listados-b3 — declarado no
// <link rel="canonical"> de app/layout.tsx. (O robots.ts do Next não gera
// comentários no arquivo; por isso a referência fica aqui e no canonical.)
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
  };
}

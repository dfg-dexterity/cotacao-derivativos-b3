# Checagem final

Rode antes de dar o trabalho por pronto. Cada item aqui já quebrou uma aplicação
do tema de verdade — não são preciosismos.

## 1. Sobras do tema antigo

```bash
# Arredondamento fora dos dois círculos permitidos (ponto de status e spinner)
grep -rn "border-radius" --include=*.css --include=*.scss . \
  | grep -v "50%" | grep -v "9999px" | grep -v "border-radius: 0"

# Cores cruas que deveriam ser token
grep -rnE "#(fff|ffffff|000|000000)\b|rgb\(255, ?255, ?255\)" --include=*.css .

# Fundos claros que sobraram do tema anterior
grep -rnE "background: ?#(f|e)[0-9a-f]{2,5}" --include=*.css .

# Foco removido
grep -rn "outline: *none\|outline: *0" --include=*.css .
```

Esperado: nada, ou só ocorrências dentro do próprio `dexterity.css`.

## 2. A armadilha do `padding`

O erro mais fácil de cometer e o mais difícil de enxergar: um elemento carrega
duas classes — o contêiner de largura (que define a margem lateral) e a do
componente. Se a do componente usar o **atalho** `padding: 24px 0`, ela zera a
lateral e o conteúdo cola na borda da janela.

```bash
# Atalhos de padding que zeram as laterais
grep -rnE "padding: [^;]+ 0;" --include=*.css .
```

Em qualquer elemento que divida a caixa com um wrapper de largura, use
`padding-block` (e `padding-inline`, se precisar), nunca o atalho.

Confirme no navegador que o conteúdo respeita a margem:

```js
// deve dar a mesma distância da esquerda em todos
['.dx-nav__in', 'h1', '.dx-foot > *:first-child']
  .map(s => [s, document.querySelector(s)?.getBoundingClientRect().left]);
```

## 3. Contraste

- Cerceta como **texto** tem de ser `--dx-cerceta-texto` (`#00B3AC`). A cor
  cheia `#009994` sobre `--dx-surface` dá 4,42:1 e reprova no AA.
- Rótulo mono usa `--dx-rotulo` (`#908C85`); `#6E6A64` só serve sobre
  `--dx-base`, não sobre cartão.
- Texto sobre botão cerceta é `--dx-base`, nunca branco.
- Vermelho de erro segue a mesma regra da cerceta: `--dx-vermelho` (`#D9563E`)
  no filete, `--dx-vermelho-texto` (`#DD6953`) no texto. A cor cheia sobre
  `--dx-surface` dá 3,96:1 — basta para elemento gráfico (3:1), reprova em texto.

```bash
# Cerceta e vermelho cheios usados como cor de TEXTO. O `[ \t;{]` antes de
# `color` evita casar com border-color / accent-color / background-color, onde
# a cor cheia é correta.
grep -rnE "[ \t;{]color: *var\(--dx-(cerceta|vermelho)\)" --include=*.css .
```

Meça com as transições paradas. Logo após um clique ou um hover, o elemento
ainda está no meio da transição de cor e o script acusa um falso positivo —
espere ~500 ms (ou mova o cursor para longe) antes de ler.

```js
// Cola no console: aponta texto abaixo de 4.5:1
const lum = (c) => { const [r,g,b] = c.match(/\d+/g).map(Number).map(v => {
  v /= 255; return v <= .03928 ? v/12.92 : ((v+.055)/1.055) ** 2.4; });
  return .2126*r + .7152*g + .0722*b; };
const fundo = (el) => { for (let e = el; e; e = e.parentElement) {
  const bg = getComputedStyle(e).backgroundColor;
  if (bg && !bg.includes('rgba(0, 0, 0, 0)')) return bg; } return 'rgb(27,27,27)'; };
[...document.querySelectorAll('*')].filter(el => el.children.length === 0 && el.textContent.trim())
  .map(el => { const cs = getComputedStyle(el);
    const [a, b] = [lum(cs.color), lum(fundo(el))].sort((x, y) => y - x);
    return { txt: el.textContent.trim().slice(0, 30), r: +((a+.05)/(b+.05)).toFixed(2) }; })
  .filter(x => x.r < 4.5);
```

## 4. Fontes carregaram

Fallback silencioso é o jeito mais rápido de o tema parecer "quase certo": sem
Barlow Condensed o título perde a condensação e a página deixa de ser Dexterity.

```js
[...document.fonts].filter(f => f.status === 'loaded').map(f => f.family);
// espere: Barlow Condensed, Figtree, IBM Plex Mono
```

Se o ambiente bloquear o Google Fonts, troque por `@fontsource` (veja
`assets/fontes.html`) em vez de aceitar o fallback.

## 5. Marca

- [ ] O logo é o SVG **inline**, não um `<img>` de PNG com fundo branco.
- [ ] As 4 pétalas aparecem, com a superior direita em cerceta.
- [ ] Passar o cursor pela marca acende as pétalas em sequência.
- [ ] Logo da SAP (se houver) é o arquivo oficial, nunca redesenhado ou animado.

## 6. Responsivo e movimento

- [ ] Em 390px de largura não há rolagem horizontal na página (tabela pode
      rolar, dentro do próprio `.dx-tabela-rolagem`).
- [ ] Margem lateral mínima de 16px em qualquer largura.
- [ ] Com `prefers-reduced-motion: reduce` o ticker, o spinner e o hover da
      marca param.

```js
document.documentElement.scrollWidth <= document.documentElement.clientWidth;
```

## 7. Teclado

- [ ] Tab percorre a página e o foco **âmbar** é visível em todo controle.
- [ ] Filtro em `.dx-chip` responde a Enter/Espaço e expõe `aria-pressed`.
- [ ] Cabeçalho de tabela ordenável tem `aria-sort`.

## 8. Prova real

Nada disso substitui abrir a página. Rode o app e confira as telas que importam
(estado inicial, estado com dados, estado de erro e, se existir, o modo
embutido). Se houver navegador disponível, uma captura por estado é a prova de
que o tema chegou inteiro.

# Receitas de componente

HTML de cada primitiva de `dexterity.css`. Copie e troque o conteúdo — as classes
já trazem tipografia, cor, borda e estado.

## Casca da página

```html
<nav class="dx-nav">
  <div class="dx-wrap dx-nav__in">
    <a class="dx-brand" href="/" aria-label="Dexterity IT Solutions">
      <!-- conteúdo de assets/marca-lockup.svg, inline -->
    </a>
    <div class="dx-nav__links">
      <a href="/painel" class="dx-on">Painel</a>
      <a href="/relatorios">Relatórios</a>
    </div>
  </div>
</nav>

<header class="dx-phead">
  <div class="dx-wrap">
    <span class="dx-eyebrow">Ferramenta interna · Tesouraria</span>
    <h1>Posição consolidada</h1>
    <p>Uma linha explicando o que a página entrega.</p>
  </div>
</header>

<section class="dx-section">
  <div class="dx-wrap">
    <div class="dx-sec-head">
      <h2>Contratos</h2>
      <p>Descrição curta à direita do título.</p>
    </div>
    <!-- conteúdo -->
  </div>
</section>

<footer>
  <div class="dx-wrap dx-foot">
    <a class="dx-brand" href="/"><!-- marca --></a>
    <p>Nota de rodapé.</p>
  </div>
</footer>
```

## Botões

```html
<button class="dx-btn">Buscar</button>
<button class="dx-btn dx-btn--ghost">Cancelar</button>
<button class="dx-btn dx-btn--sm">Exportar</button>
<button class="dx-btn" disabled>Indisponível</button>
```

O `.dx-btn` inverte no hover (fundo some, texto fica cerceta). É intencional:
não troque por escurecer/clarear.

## Campos

```html
<div class="dx-field">
  <label for="data">Data do pregão</label>
  <input id="data" type="date">
</div>

<div class="dx-field">
  <label for="tipo">Arquivo</label>
  <select id="tipo"><option>SPRD</option></select>
</div>
```

O rótulo vira mono/caixa alta sozinho. `color-scheme: dark` já está aplicado em
`input[type=date]` e `select` para o widget nativo não voltar branco.

## Superfícies

```html
<!-- Cartão simples -->
<div class="dx-card" style="padding:24px">…</div>

<!-- Painel com cabeçalho e rodapé -->
<div class="dx-painel">
  <div class="dx-painel__hd"><h3>Integrações</h3><small>atualizado 08:12</small></div>
  <div style="padding:14px 18px">…</div>
  <div class="dx-painel__ft">Última sincronização há 3 min</div>
</div>

<!-- Grade de filetes: o "gap" é a linha da marca -->
<div class="dx-grid" style="--dx-cols:4">
  <div>…</div><div>…</div><div>…</div><div>…</div>
</div>

<!-- Destaque com filete lateral -->
<div class="dx-realce"><p>Texto do aviso.</p><a class="dx-btn" href="#">Agir</a></div>
<div class="dx-realce dx-realce--acento">…</div>
```

Em `.dx-grid`, `--dx-cols` define as colunas e `--dx-cols-mob` o que acontece
abaixo de 900px (padrão: 1).

## Números e status

```html
<div class="dx-grid" style="--dx-cols:3">
  <div class="dx-stat"><b>41.892</b><span>Cotações no arquivo</span></div>
  <div class="dx-stat"><b>D-1</b><span>Defasagem</span></div>
  <div class="dx-stat"><b>252</b><span>Base de dias úteis</span></div>
</div>

<span class="dx-dot dx-dot--on"></span>
<span class="dx-dot dx-dot--warn"></span>
<span class="dx-girador" aria-hidden="true"></span>

<div class="dx-card dx-erro" style="padding:20px">
  <strong>Não foi possível concluir.</strong>
  <span>Mensagem do erro.</span>
</div>
```

## Tabela de dados

```html
<div class="dx-tabela-rolagem">
  <table class="dx-tabela">
    <thead>
      <tr>
        <th>Ticker</th>
        <th class="dx-num" aria-sort="none">Ajuste</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>DI1F27</td>
        <td class="dx-num">98.055,12 <span class="dx-up">+0,45</span></td>
      </tr>
    </tbody>
  </table>
</div>
```

- `.dx-num` alinha à direita **e** troca para IBM Plex Mono com
  `tabular-nums` — é o que faz a coluna de números alinhar dígito a dígito.
- Célula sem valor: `<span class="dx-vazio">—</span>`, nunca vazia.
- Cabeçalho ordenável: `aria-sort` (`none` / `ascending` / `descending`), que
  também é o que faz o cursor virar ponteiro.

## Etiquetas e filtros

```html
<div class="dx-tags"><span>Base 252</span><span>Curva pré</span></div>

<button class="dx-chip" aria-pressed="true">DI1</button>
<button class="dx-chip" aria-pressed="false">DOL</button>
```

O estado do `.dx-chip` sai do `aria-pressed` — não crie classe `.ativo`. Assim
o estado visual e o acessível não têm como divergir.

## Ticker de mercado

Faixa animada do topo do site. Duplique o conjunto de itens (a animação desloca
50%) e marque a cópia com `aria-hidden="true"`.

```html
<div class="dx-ticker" aria-label="Indicadores">
  <div class="dx-ticker__track">
    <div class="dx-ticker__set">
      <div class="dx-tk"><b>CDI</b><span>14,90%</span><i class="dx-up">a.a.</i></div>
      <div class="dx-tk"><b>USD/BRL</b><span>5,4210</span><i class="dx-down">-0,34%</i></div>
    </div>
    <div class="dx-ticker__set" aria-hidden="true"><!-- cópia idêntica --></div>
  </div>
</div>
```

## Tailwind e utilitários

Não converta utilitário por utilitário. O caminho curto:

1. Publique os tokens no `tailwind.config` apontando para as variáveis, de modo
   que `bg-surface`/`text-acento` passem a existir sem duplicar valores:

   ```js
   theme: { extend: {
     colors: { base: 'var(--dx-base)', surface: 'var(--dx-surface)',
               acento: 'var(--dx-cerceta)', 'acento-txt': 'var(--dx-cerceta-texto)',
               linha: 'var(--dx-line)', off: 'var(--dx-off)' },
     fontFamily: { display: 'var(--dx-display)', corpo: 'var(--dx-body)',
                   mono: 'var(--dx-mono)' },
     borderRadius: { DEFAULT: '0', md: '0', lg: '0', xl: '0', full: '9999px' },
   }}
   ```

2. Zere o arredondamento no tema (acima) em vez de caçar `rounded-*` no markup.
3. Troque componentes inteiros (botão, campo, card) pelas classes `dx-`, que já
   carregam o conjunto certo.
4. Procure o que sobrou: `grep -rE "bg-(white|gray|slate)|text-(black|gray)-[89]"`.

## Frameworks de componente (MUI, Bootstrap, shadcn…)

Ajuste o tema do framework para os tokens em vez de sobrescrever no CSS: cor
primária = `--dx-cerceta`, superfícies = `--dx-surface`, raio = 0, fontes = os
três tokens. Só depois trate as sobras pontuais.

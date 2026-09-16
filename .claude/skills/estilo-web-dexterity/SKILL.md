---
name: estilo-web-dexterity
description: >-
  Aplica a identidade visual web da Dexterity IT Solutions (tema escuro do site
  oficial: fundo grafite, cerceta, Barlow Condensed / Figtree / IBM Plex Mono,
  cantos vivos e grade de filetes) em qualquer interface — app Next/React/Vue,
  HTML puro, painel interno, página em Odoo, dashboard, ferramenta de mercado.
  Use quando o pedido for "aplique os estilos/a identidade da Dexterity",
  "deixe com a cara da Dexterity", "padronize o visual deste app", "aplique a
  marca no front", "coloque no tema do site da Dexterity", ou equivalentes em
  inglês ("apply the Dexterity branding/design system to this app/page").
  Para documentos Word use `documento-dexterity`; para planilhas, `aplicar-estilos`.
---

# Estilo web Dexterity

Transforma uma interface existente no tema escuro publicado em
dexterityit.com.br. O trabalho é **trocar a camada de estilo**, não redesenhar o
produto: a estrutura, os textos e a lógica ficam como estão.

O resultado precisa parecer uma página do site da empresa, e não "um app com
cores da empresa". A diferença está em quatro coisas, nesta ordem de importância:
tipografia condensada em caixa alta, fundo escuro, **cantos vivos** e filetes de
1px no lugar de sombras e bordas arredondadas.

## Fluxo

### 1. Levantar o que existe

Antes de mexer, liste: qual arquivo concentra o CSS, quais componentes têm estilo
próprio (inline, CSS-in-JS, Tailwind), e onde estão logo, cabeçalho e rodapé.

Se o projeto usa **Tailwind ou outro framework de utilitários**, não tente
converter classe por classe: leia `references/componentes.md`, seção "Tailwind".

### 2. Instalar a base

Copie `assets/dexterity.css` para o projeto (em Next: `app/dexterity.css`; em
HTML puro, ao lado do index) e carregue-o **antes** do CSS do aplicativo:

```css
/* globals.css / style.css do app */
@import './dexterity.css';
```

Cole `assets/fontes.html` no `<head>`. Sem as três fontes o tema perde a cara da
marca — a checagem final confirma que carregaram.

### 3. Trocar a casca

- **Logo**: use `assets/marca-lockup.svg` **inline** (não `<img>`), para que as
  pétalas herdem `--mk`/`--acc` e reajam ao cursor. Um PNG de logo com fundo
  branco **não serve** no tema escuro — é o erro mais comum aqui.
- **Cabeçalho**: barra fina e fixa (`.dx-nav`) com a marca à esquerda; o título
  grande vai no corpo, em `.dx-phead` (rótulo mono + `<h1>` + parágrafo).
- **Rodapé**: `.dx-foot`.

### 4. Mapear os componentes

Substitua o estilo próprio pelas primitivas. Tabela completa de equivalências e
o HTML de cada uma em `references/componentes.md`.

| No app                        | Vira                                      |
| ----------------------------- | ----------------------------------------- |
| Botão primário / secundário   | `.dx-btn` / `.dx-btn--ghost`               |
| Campo de formulário + rótulo  | `.dx-field`                                |
| Card, caixa, painel           | `.dx-card` ou `.dx-painel`                 |
| Grade de cards                | `.dx-grid` (com `--dx-cols`)               |
| Tabela de dados               | `.dx-tabela` (+ `.dx-num` nas colunas numéricas) |
| Badge, tag, pill              | `.dx-tag` / `.dx-chip` (filtro clicável)   |
| Rótulo pequeno / metadado     | `.dx-eyebrow` (destaque) ou `.dx-mono`     |
| Spinner, status, erro         | `.dx-girador`, `.dx-dot`, `.dx-erro`       |
| Número de destaque / KPI      | `.dx-stat`                                 |

Mantenha as classes semânticas do app onde elas posicionam coisas (grades,
larguras, breakpoints) e deixe as `dx-` cuidarem da aparência. Não redefina
tokens nem primitivas dentro do CSS do app — o arquivo da marca é a fonte única.

### 5. Verificar

Rode a checagem de `references/checklist.md`. Ela pega os erros que só aparecem
depois: contraste insuficiente, sobra de `border-radius`, foco invisível, e o
atalho `padding` zerando a margem lateral.

## Regras que não se negociam

1. **Cantos vivos.** `border-radius: 0` em tudo, exceto o ponto de status e o
   spinner, que são círculos. Se sobrou um botão arredondado, o tema falhou.
2. **Cerceta é cor de ação**, não de decoração: botão primário, link, foco de
   campo, filete sob o cabeçalho da tabela. Não pinte texto corrido de cerceta.
3. **Cerceta em texto usa `--dx-cerceta-texto` (`#00B3AC`)**, nunca
   `#009994`: sobre `--dx-surface` a cor cheia dá 4,42:1 e reprova no WCAG AA.
   Em fundo e borda, a cor cheia continua valendo.
4. **Foco sempre visível, sempre âmbar** (`--dx-amarelo`). Nunca `outline: none`.
5. **Separação por filete de 1px**, não por sombra. A "grade" da marca é o
   `gap: 1px` sobre um fundo `--dx-line` — veja `.dx-grid`.
6. **Alta e baixa** seguem o ticker do site: cerceta sobe (`.dx-up`), âmbar cai
   (`.dx-down`). Não use verde nem vermelho aqui.
7. **Vermelho é só erro** (`.dx-erro`). Como âmbar já significa "baixa", dividir
   a cor faria uma queda de preço e uma falha ficarem iguais. No filete vale
   `--dx-vermelho`; em texto, `--dx-vermelho-texto`.
8. **Âmbar, roxo e musgo são acentos pontuais** (alerta, filete lateral,
   categoria). Nunca superfície nem texto corrido.

## Paleta e tipografia

| Token                  | Valor     | Uso                                     |
| ---------------------- | --------- | --------------------------------------- |
| `--dx-base`            | `#1B1B1B` | Fundo da página                         |
| `--dx-surface`         | `#242424` | Cartões, painéis, células da grade      |
| `--dx-surface-2`       | `#2E2E2E` | Cabeçalho de painel e de tabela         |
| `--dx-surface-3`       | `#1F1F1F` | Fundo de campo de formulário            |
| `--dx-line`            | `rgba(247,243,231,.13)` | Filetes e bordas          |
| `--dx-cerceta`         | `#009994` | Ação: fundo de botão, borda, filete     |
| `--dx-cerceta-texto`   | `#00B3AC` | Cerceta quando for **texto**            |
| `--dx-amarelo`         | `#FFA436` | Foco, alerta, baixa                     |
| `--dx-vermelho`        | `#D9563E` | **Só** erro, e só em filete/ícone        |
| `--dx-vermelho-texto`  | `#DD6953` | O mesmo vermelho quando for **texto**    |
| `--dx-off`             | `#F7F3E7` | Texto principal                         |
| `--dx-texto-suave`     | `#D8D2C6` | Parágrafo secundário                    |
| `--dx-rotulo`          | `#908C85` | Rótulo mono (legível sobre `--dx-surface`) |
| `--dx-roxo` / `--dx-musgo` | `#98569A` / `#597C59` | Acento de categoria      |

- **Títulos** — Barlow Condensed 600, CAIXA ALTA, `line-height: .92`.
- **Corpo** — Figtree 300, 17px, `line-height: 1.6`.
- **Rótulo técnico** — IBM Plex Mono 11px, `letter-spacing: .13em–.18em`, CAIXA ALTA.
  É a assinatura da marca: rótulo de campo, cabeçalho de tabela, metadado, tag.

## Onde ficam os arquivos

Todos os caminhos citados aqui são relativos à pasta deste skill:

| Arquivo                         | O que é                                          |
| ------------------------------- | ------------------------------------------------ |
| `assets/dexterity.css`          | A folha da marca. É o arquivo que se copia para o projeto. |
| `assets/fontes.html`            | As tags `<link>` das três fontes.                |
| `assets/marca-lockup.svg`       | Lockup oficial (símbolo + nome), para o cabeçalho e o rodapé. |
| `assets/marca-simbolo.svg`      | Só o símbolo de 4 pétalas, para favicon e usos pequenos. |
| `references/componentes.md`     | HTML de cada primitiva, e o caminho para Tailwind e frameworks de componente. |
| `references/checklist.md`       | A checagem final, com os comandos prontos.       |
| `scripts/instalar.sh`           | Copia este skill para `~/.claude/skills` ou para outro repositório (só faz sentido no Claude Code, com acesso a arquivos). |

## Referência de origem

O tema é o do site institucional em Odoo. Os arquivos publicados lá (o CSS do
`<head>` e os blocos de cada página) são a fonte da verdade; `assets/dexterity.css`
é a extração deles em forma reutilizável, com os nomes curtos do site
(`--cerceta`, `--off`, `--base`…) mantidos como apelidos, de modo que **HTML
copiado do site funciona sem edição**.

As ferramentas de Dados de Mercado nomeiam os mesmos tokens com o prefixo
`--dxt-`. Esses nomes também entram como apelidos, então a folha pode ser
adotada num projeto que já siga aquela convenção sem renomear nada.

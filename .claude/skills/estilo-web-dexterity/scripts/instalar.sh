#!/usr/bin/env bash
# Instala o skill `estilo-web-dexterity` em ~/.claude/skills, deixando-o
# disponível em qualquer projeto da máquina (e não só neste repositório).
#
#   .claude/skills/estilo-web-dexterity/scripts/instalar.sh
#   .claude/skills/estilo-web-dexterity/scripts/instalar.sh /caminho/outro-projeto
#
# Sem argumento, instala para o usuário. Com um caminho de projeto, instala em
# <projeto>/.claude/skills (útil para versionar o skill junto com aquele repo).
set -euo pipefail

origem="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
nome="$(basename "$origem")"

if [ $# -gt 0 ]; then
  [ -d "$1" ] || { echo "erro: '$1' não é um diretório." >&2; exit 1; }
  destino="$1/.claude/skills"
else
  destino="${HOME}/.claude/skills"
fi

mkdir -p "$destino"

if [ -e "$destino/$nome" ]; then
  echo "Já existe $destino/$nome."
  read -r -p "Substituir? [s/N] " resposta
  case "$resposta" in
    [sSyY]) rm -rf "${destino:?}/$nome" ;;
    *) echo "Cancelado."; exit 0 ;;
  esac
fi

cp -R "$origem" "$destino/$nome"
chmod +x "$destino/$nome/scripts/instalar.sh" 2>/dev/null || true

echo "Instalado em $destino/$nome"
echo "Abra uma nova sessão do Claude Code e peça: \"aplique os estilos da Dexterity\"."

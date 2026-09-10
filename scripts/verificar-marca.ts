// A folha da identidade existe em dois lugares por motivos diferentes:
//   - `app/dexterity.css` é o que o Next importa (fonte da verdade);
//   - `.claude/skills/estilo-web-dexterity/assets/dexterity.css` é o que o skill
//     copia para outros projetos, e por isso precisa ser autocontido.
// Se as duas divergirem, o skill passa a espalhar um tema desatualizado — este
// teste existe para que isso apareça no `npm run testar`, e não meses depois.

import { readFileSync } from 'node:fs';

const FONTE = 'app/dexterity.css';
const COPIA = '.claude/skills/estilo-web-dexterity/assets/dexterity.css';

const fonte = readFileSync(FONTE, 'utf8');
const copia = readFileSync(COPIA, 'utf8');

if (fonte !== copia) {
  console.error(`✖ ${FONTE} e ${COPIA} divergiram.`);
  console.error(`  Sincronize com:  cp ${FONTE} ${COPIA}`);
  process.exit(1);
}

console.log(`✔ Identidade em dia: ${COPIA} idêntico a ${FONTE}.`);

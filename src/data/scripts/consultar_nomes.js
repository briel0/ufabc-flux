import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⚠️ AJUSTE ESTE CAMINHO SE PRECISAR
const DB_PATH = path.resolve(__dirname, '../data.db'); 

const disciplinasFaltantes = [
  'BCS0001-15', 'BCS0002-15',
  'ESTG013-17', 'MCCC011-23',
  'MCCC017-23', // O famoso erro de digitação do coordenador
  'MCTB007-17', 'MCTB018-17',
  'MCTC021-20', 'MCTC022-15',
  'MCZB018-13'
];

function consultarDisciplinas() {
    console.log("🔍 Conectando ao banco de dados...\n");
    const db = new Database(DB_PATH);

    // Query preparada usando LIKE para sermos flexíveis com os anos
    const stmt = db.prepare('SELECT id, nome FROM disciplinas WHERE id LIKE ?');

    const encontradas = [];
    const perdidas = [];

    disciplinasFaltantes.forEach(siglaSuja => {
        // 1. Extrai a base (Ex: 'BCS0001-15' -> 'BCS0001')
        // 2. Se tiver '???', troca por '%' para o SQL buscar qualquer coisa que comece com 'MCCC'
        let baseParaBusca = siglaSuja.split('-')[0].replace('???', '%');
        
        // Busca no banco qualquer id que comece com essa base
        const resultados = stmt.all(`${baseParaBusca}%`);

        if (resultados.length > 0) {
            resultados.forEach(row => {
                encontradas.push(`✅ Buscou [${siglaSuja}] -> Achou: ${row.id} - ${row.nome}`);
            });
        } else {
            perdidas.push(`❌ ${siglaSuja}: DEFINITIVAMENTE NÃO EXISTE NO BANCO.`);
        }
    });

    db.close();

    // Imprime os resultados organizados
    console.log("=== MATÉRIAS ENCONTRADAS ===");
    encontradas.forEach(msg => console.log(msg));

    if (perdidas.length > 0) {
        console.log("\n=== FANTASMAS (Nem com reza brava) ===");
        perdidas.forEach(msg => console.log(msg));
    }
}

consultarDisciplinas();
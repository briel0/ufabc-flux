import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ajuste os caminhos conforme sua estrutura
const INPUT_PATH = path.resolve(__dirname, 'raw/materias.csv');
const OUTPUT_PATH = path.resolve(__dirname, 'raw/materias_simplificado.csv');

function simplify() {
    try {
        console.log("✂️ Simplificando CSV...");

        const inputRaw = fs.readFileSync(INPUT_PATH, 'utf-8');
        
        // Faz o parse do CSV original
        const records = parse(inputRaw, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        // Mapeia apenas as colunas desejadas
        // Nota: Ajustei o 'NOME' para 'DISCIPLINA' conforme seu pedido
        const simplified = records.map(row => ({
            SIGLA: row['SIGLA'],
            DISCIPLINA: row['NOME'] || row['NOME DA DISCIPLINA'] || row['DISCIPLINA'],
            RECOMENDAÇÃO: row['RECOMENDAÇÃO']
        }));

        // Gera o novo CSV
        const outputCSV = stringify(simplified, {
            header: true
        });

        fs.writeFileSync(OUTPUT_PATH, outputCSV);
        
        console.log(`✅ CSV simplificado gerado em: ${OUTPUT_PATH}`);
        console.log(`📊 Total de matérias processadas: ${simplified.length}`);

    } catch (err) {
        console.error("❌ Erro ao processar CSV:", err.message);
    }
}

simplify();
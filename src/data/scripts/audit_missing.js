import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import csv from 'csv-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⚠️ AJUSTE ESTES CAMINHOS
const DB_PATH = path.resolve(__dirname, '../data.db');
const CSV_PATH = path.resolve(__dirname, 'recomendacoes_filtradas.csv');
const MISSING_OUTPUT_PATH = path.resolve(__dirname, 'materias_orfans.json');

function auditData() {
    console.log("⏳ Lendo o CSV filtrado...");
    const siglasNoCSV = new Set();

    // 1. Carrega todas as siglas do CSV para a memória
    fs.createReadStream(CSV_PATH)
        .pipe(csv())
        .on('data', (row) => {
            siglasNoCSV.add(row['SIGLA']);
        })
        .on('end', () => {
            console.log(`✅ ${siglasNoCSV.size} siglas encontradas no CSV.`);

            console.log("🔍 Conectando ao banco de dados...");
            const db = new Database(DB_PATH);

            // 2. Puxa as matérias do banco (DISTINCT para não repetir matérias compartilhadas entre cursos)
            const materiasDoBanco = db.prepare('SELECT DISTINCT disciplina_id FROM curso_disciplinas').all();
            console.log(`✅ ${materiasDoBanco.length} disciplinas únicas na tabela curso_disciplinas.`);

            const materiasFaltantes = [];

            // 3. O Cruzamento: Quem está no banco mas NÃO está no Set do CSV?
            for (const row of materiasDoBanco) {
                if (!siglasNoCSV.has(row.disciplina_id)) {
                    materiasFaltantes.push(row.disciplina_id);
                }
            }

            db.close();

            // 4. O Veredito
            console.log(`\n🚨 ALERTA: Encontramos ${materiasFaltantes.length} disciplinas no Banco que NÃO possuem linha no CSV!`);

            if (materiasFaltantes.length > 0) {
                // Salva em JSON para ficar fácil de ler no VS Code
                fs.writeFileSync(MISSING_OUTPUT_PATH, JSON.stringify(materiasFaltantes, null, 2));
                console.log(`📝 Lista de siglas órfãs salva em: ${MISSING_OUTPUT_PATH}`);
                console.log("Primeiras 5 siglas faltantes para você ter uma ideia:");
                console.log(materiasFaltantes.slice(0, 11));
            } else {
                console.log("🎉 Sucesso total! Todas as matérias do banco possuem correspondência exata no CSV.");
            }
        });
}

auditData();
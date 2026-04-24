// Substitua os requires por imports
import fs from 'node:fs';
import { parse } from 'csv-parse/sync';
import Database from 'better-sqlite3';

const db = new Database('data.db');

// 1. Carrega o arquivo CSV (garanta que o nome do arquivo esteja correto)
const input = fs.readFileSync('materias.csv', 'utf-8');

// 2. Converte para Objetos
const records = parse(input, {
  columns: true,
  skip_empty_lines: true,
  trim: true
});

const insertStmt = db.prepare(`
  INSERT OR REPLACE INTO disciplinas (id, nome, metadata_json)
  VALUES (?, ?, ?)
`);

// 3. Processamento em Transação
const runImport = db.transaction((data) => {
  console.log("🧹 Limpando metadados e importando disciplinas...");
  
  for (const row of data) {
    // Montamos o metadata SEM a coluna 'RECOMENDAÇÃO'
    const metadata = {
      tpei: row['TPEI'],
      objetivos: row['OBJETIVOS'],
      ementa: row['EMENTA'],
      bibliografia: {
        basica: row['BIBLIOGRAFIA BÁSICA'],
        complementar: row['BIBLIOGRAFIA COMPLEMENTAR']
      }
    };

    insertStmt.run(
      row['SIGLA'], 
      row['DISCIPLINA'], 
      JSON.stringify(metadata)
    );
  }
});

try {
  runImport(records);
  console.log(`✅ Sucesso! ${records.length} matérias prontas no banco.`);
} catch (err) {
  console.error("❌ Erro na importação:", err);
} finally {
  db.close();
}
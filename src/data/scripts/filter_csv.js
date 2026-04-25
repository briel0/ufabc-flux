import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import csv from 'csv-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mantendo os seus caminhos exatos
const DB_PATH = path.resolve(__dirname, '../data.db'); 
const CSV_INPUT_PATH = path.resolve(__dirname, '../raw/materias_simplificado.csv'); 
const CSV_OUTPUT_PATH = path.resolve(__dirname, 'recomendacoes_filtradas.csv'); 

// Função auxiliar para escapar vírgulas no novo CSV
function escapeCSV(text) {
    if (!text) return '';
    if (text.includes(',') || text.includes('"')) {
        return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
}

// NOVA FUNÇÃO: Remove o traço e o ano da sigla (ex: "ESZR007-21" vira "ESZR007")
function extrairBaseSigla(sigla) {
    if (!sigla) return '';
    return sigla.split('-')[0].trim();
}

function processCSV() {
    console.log("🔍 Conectando ao banco de dados...");
    const db = new Database(DB_PATH);

    console.log("📥 Puxando siglas do banco e extraindo a base (ignorando o ano)...");
    const rows = db.prepare('SELECT DISTINCT disciplina_id FROM curso_disciplinas').all();
    
    // O Set agora guarda apenas o núcleo das matérias do banco
    const siglasBaseValidas = new Set(rows.map(row => extrairBaseSigla(row.disciplina_id)));
    console.log(`✅ ${siglasBaseValidas.size} siglas base únicas encontradas no SQLite.`);

    db.close();

    console.log("⏳ Iniciando filtragem do CSV...");
    let countLidas = 0;
    let countSalvas = 0;

    const writeStream = fs.createWriteStream(CSV_OUTPUT_PATH);
    writeStream.write('SIGLA,DISCIPLINA,RECOMENDAÇÃO\n');

    fs.createReadStream(CSV_INPUT_PATH)
        .pipe(csv())
        .on('data', (row) => {
            countLidas++;
            
            const siglaOriginalCSV = row['SIGLA'];
            const disciplina = row['DISCIPLINA'];
            const recomendacao = row['RECOMENDAÇÃO'];

            // Extrai a base da sigla atual do CSV para fazer a comparação
            const baseSiglaCSV = extrairBaseSigla(siglaOriginalCSV);

            // Bate o núcleo do CSV contra o núcleo do Banco de Dados
            if (siglasBaseValidas.has(baseSiglaCSV)) {
                countSalvas++;
                // Escreve no novo arquivo usando a sigla completa (com - e ano) do CSV
                const linhaLimpa = `${escapeCSV(siglaOriginalCSV)},${escapeCSV(disciplina)},${escapeCSV(recomendacao)}\n`;
                writeStream.write(linhaLimpa);
            }
        })
        .on('end', () => {
            writeStream.end();
            console.log("\n🚀 OPERAÇÃO CONCLUÍDA COM SUCESSO!");
            console.log(`📊 Linhas totais no CSV original: ${countLidas}`);
            console.log(`🎯 Linhas mantidas no novo CSV: ${countSalvas}`);
            console.log(`🗑️  Lixo descartado: ${countLidas - countSalvas} matérias inúteis.`);
            console.log(`📁 Salvo em: ${CSV_OUTPUT_PATH}`);
        });
}

processCSV();
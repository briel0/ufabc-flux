import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⚠️ Ajuste 'data.db' para o nome exato do seu arquivo de banco
const DB_PATH = path.resolve(__dirname, '../data.db'); 
const JSON_OUTPUT_PATH = path.resolve(__dirname, '../courses.json');

const db = new Database(DB_PATH);

function exportCourses() {
    console.log("🔍 Extraindo cursos do banco de dados...");

    // Puxa tudo usando o schema que você me passou
    const cursosDb = db.prepare("SELECT id, nome FROM cursos").all();

    // Pipeline: Transforma o dado bruto do banco no formato perfeito para o React
    const cursosFormatados = cursosDb.map(curso => {
        // Formata o nome para ficar limpo. Ex: se for "BCC", vira "Ciência da Computação (BCC)"
        // Se for uma sigla desconhecida, ele repete a sigla.
        let fullName = curso.nome;

        return {
            name: fullName,
            disabled: false // Vamos deixar todos clicáveis por padrão agora
        };
    });

    fs.writeFileSync(JSON_OUTPUT_PATH, JSON.stringify(cursosFormatados, null, 2));
    console.log(`✅ Pipeline concluído! ${cursosFormatados.length} cursos injetados em: ${JSON_OUTPUT_PATH}`);
}

try {
    exportCourses();
} finally {
    db.close();
}
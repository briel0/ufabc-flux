PRAGMA foreign_keys = ON;

-- 1. As Matérias (Entidades Puras)
CREATE TABLE IF NOT EXISTS disciplinas (
    id TEXT PRIMARY KEY,       -- Ex: 'BCN0404-15'
    nome TEXT NOT NULL,
    metadata_json TEXT
);

-- 2. Os Cursos (Entidades Puras)
CREATE TABLE IF NOT EXISTS cursos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE  -- Ex: 'BCC', 'BC&T', 'Eng. Aeroespacial'
);

-- 3. A Tabela de Vínculo (Onde a mágica acontece)
-- Aqui dizemos qual matéria pertence a qual curso e qual o status dela lá dentro
CREATE TABLE IF NOT EXISTS curso_disciplinas (
    curso_id INTEGER,
    disciplina_id TEXT,
    -- 'obrigatoria', 'limitada' ou 'livre'
    categoria TEXT NOT NULL, 
    
    PRIMARY KEY (curso_id, disciplina_id),
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
    FOREIGN KEY (disciplina_id) REFERENCES disciplinas(id) ON DELETE CASCADE
);

-- 4. O Grafo (Arestas de pré-requisito)
CREATE TABLE IF NOT EXISTS requisitos (
    target_id TEXT,
    source_id TEXT,
    PRIMARY KEY (target_id, source_id),
    FOREIGN KEY (target_id) REFERENCES disciplinas(id) ON DELETE CASCADE,
    FOREIGN KEY (source_id) REFERENCES disciplinas(id) ON DELETE CASCADE
);
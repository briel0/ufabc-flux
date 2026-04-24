# UFABC Flux - Data Pipeline 🚀

Este diretório contém a infraestrutura de **ETL** (Extract, Transform, Load) para o grafo de disciplinas da UFABC. O objetivo é transformar documentos brutos (PDFs, TXTs, JSONs) em uma base de dados relacional otimizada.

## 📂 Estrutura de Pastas

- `/raw`: Arquivos brutos e não processados (`lista-de-cursos.txt`, `materiasbcc.json`).
- `/scripts`: Motores de processamento (C++ para parsing, Node.js para ingestão).
- `/sql`: Scripts de definição de esquema e inserts gerados.
- `data.db`: O binário do SQLite (Fonte da Verdade).

---

## 🛠️ Pipeline de Execução (Passo a Passo)

Siga esta ordem exata para garantir a integridade das Chaves Estrangeiras:

### Passo 0: Inicialização do Esquema

Cria a estrutura das tabelas (`Cursos`, `Disciplinas`, `curso_disciplinas` e `requisitos`).

```bash
sqlite3 ufabc.db < sql/schema.sql
```

### Passo 1: Extração da Lista de Cursos

Geração do arquivo bruto `raw/lista-de-cursos.txt` a partir do portal da Prograd. Este passo é manual e o arquivo já se encontra no repositório.

### Passo 2: Parsing e Ingestão de Cursos

Utiliza o parser em C++ para gerar o arquivo SQL de inserção e popular a tabela `Cursos`.

```bash
# 1. Compilar o parser
g++ scripts/parsing.cpp -o parser

# 2. Executar e gerar o SQL
./parser raw/lista-de-cursos.txt > sql/cursos_insert.sql

# 3. Injetar no banco de dados
sqlite3 ufabc.db < sql/cursos_insert.sql
```

### Passo 3: Ingestão de Disciplinas e Metadados

Lê o arquivo `raw/materiasbcc.json` e popula a tabela `Disciplinas`. O script Node.js é responsável por essa tarefa.

```bash
node scripts/import_disciplinas.js
```

### Passo 4: Vínculos e Pré-requisitos (Próximos Passos)

Esta etapa ainda está em desenvolvimento e irá:
- Vincular disciplinas aos seus respectivos cursos na tabela `curso_disciplinas`.
- Extrair as `recomendações` de cada disciplina para popular a tabela de `requisitos` (as arestas do grafo).

📌 Notas de Manutenção

**Reset Total**: Caso precise limpar a base e recomeçar do zero, execute:
```bash
rm -f ufabc.db && sqlite3 ufabc.db < sql/schema.sql
```

**Integridade**: Sempre verifique as relações após rodar o passo de vínculos para evitar "nós órfãos" no grafo final.
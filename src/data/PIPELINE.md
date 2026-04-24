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
sqlite3 data.db < sql/squema.sql
```

### Passo 1

Geração do arquivo bruto `raw/lista-de-cursos.txt` a partir do portal da Prograd. Este passo é manual e o arquivo já se encontra no repositório.

### Passo 2

Utiliza o parser em C++ para gerar o arquivo SQL de inserção (`sql/output.sql`) e popular a tabela `Cursos`.

```bash
# 1. Compilar o parser
g++ scripts/parsing.cpp -o parser

# 2. Executar e gerar o SQL
./parser < raw/lista-de-cursos.txt > sql/output.sql

# 3. Injetar no banco de dados
sqlite3 data.db < sql/output.sql
```

### Passo 3

Lê um arquivo CSV (`materias.csv`, não versionado) e popula a tabela `Disciplinas` com nome e metadados (ementa, bibliografia, etc).

```bash
node scripts/import_csv.js
```

### Passo 4

Esta etapa ainda está em desenvolvimento e irá:
- Vincular disciplinas aos seus respectivos cursos na tabela `curso_disciplinas`.
- Extrair as `recomendações` de cada disciplina para popular a tabela de `requisitos` (as arestas do grafo).

### Passo 5

Esta etapa utiliza o script `import_bcc_obrigatorias.js` para popular o banco de dados com as disciplinas obrigatórias do Bacharelado em Ciência da Computação, lendo os dados do arquivo `raw/bcc/materiasbcc.json`.

```bash
node scripts/import_bcc_obrigatorias.js
```

### Passo 5

Esta etapa utiliza o script `import_bcc_limitadas.js` para popular o banco de dados com as disciplinas obrigatórias do Bacharelado em Ciência da Computação, lendo os dados do arquivo `raw/bcc/limitadas-bcc.txt`.

```bash
node scripts/import_bcc_limitadas.js
```

passo 6 - criei o import requisitos pra popular a tabela de requisitos a partir do materias.csv

📌 Notas de Manutenção

**Reset Total**: Caso precise limpar a base e recomeçar do zero, execute:
```bash
rm -f ufabc.db && sqlite3 ufabc.db < sql/schema.sql
```

**Integridade**: Sempre verifique as relações após rodar o passo de vínculos para evitar "nós órfãos" no grafo final.
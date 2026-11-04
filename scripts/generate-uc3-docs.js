'use strict';

const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const mysql = require('mysql2/promise');
const dbName = process.env.DB_NAME || 'omnilog_hub';

async function main() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3307),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: dbName
  });

  try {
    const [tables] = await db.execute(
      `SELECT TABLE_NAME, TABLE_TYPE
       FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ?
       ORDER BY TABLE_NAME`,
      [dbName]
    );

    const [columns] = await db.execute(
      `SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE,
              IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT, EXTRA
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ?
       ORDER BY TABLE_NAME, ORDINAL_POSITION`,
      [dbName]
    );

const [foreignKeys] = await db.execute(
  `SELECT
      k.TABLE_NAME,
      k.COLUMN_NAME,
      k.CONSTRAINT_NAME,
      k.REFERENCED_TABLE_NAME,
      k.REFERENCED_COLUMN_NAME,
      r.UPDATE_RULE,
      r.DELETE_RULE
   FROM information_schema.KEY_COLUMN_USAGE k
   JOIN information_schema.REFERENTIAL_CONSTRAINTS r
     ON r.CONSTRAINT_SCHEMA = k.CONSTRAINT_SCHEMA
    AND r.CONSTRAINT_NAME = k.CONSTRAINT_NAME
    AND r.TABLE_NAME = k.TABLE_NAME
   WHERE k.CONSTRAINT_SCHEMA = ?
     AND k.REFERENCED_TABLE_NAME IS NOT NULL
   ORDER BY k.TABLE_NAME`,
  [dbName]
);

    const [checks] = await db.execute(
      `SELECT tc.TABLE_NAME, tc.CONSTRAINT_NAME, cc.CHECK_CLAUSE
       FROM information_schema.TABLE_CONSTRAINTS tc
       JOIN information_schema.CHECK_CONSTRAINTS cc
       ON cc.CONSTRAINT_SCHEMA = tc.CONSTRAINT_SCHEMA
       AND cc.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
       WHERE tc.CONSTRAINT_SCHEMA = ?
       AND tc.CONSTRAINT_TYPE = 'CHECK'`,
      [dbName]
    );

    const [indexes] = await db.execute(
      `SELECT TABLE_NAME, INDEX_NAME, NON_UNIQUE,
              GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS columns_list
       FROM information_schema.STATISTICS
       WHERE TABLE_SCHEMA = ?
       GROUP BY TABLE_NAME, INDEX_NAME, NON_UNIQUE
       ORDER BY TABLE_NAME`,
      [dbName]
    );

    const safe = value =>
      String(value ?? '—').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');

    const lines = [
      '# UC3 - Dicionário de Dados',
      '',
      `Banco: ${dbName}`,
      `Gerado em: ${new Date().toLocaleString('pt-BR')}`,
      '',
      '## 1. Visão geral',
      '',
      `- Estruturas encontradas: ${tables.length}`,
      `- Tabelas físicas: ${tables.filter(t => t.TABLE_TYPE === 'BASE TABLE').length}`,
      `- Views: ${tables.filter(t => t.TABLE_TYPE === 'VIEW').length}`,
      `- Chaves estrangeiras: ${foreignKeys.length}`,
      `- Restrições CHECK: ${checks.length}`,
      '',
      '## 2. Estrutura das tabelas',
      ''
    ];

    for (const table of tables) {
      lines.push(`### ${table.TABLE_NAME}`);
      lines.push('');
      lines.push(`Tipo: ${table.TABLE_TYPE}`);
      lines.push('');
      lines.push('| Campo | Tipo | NULL | Chave | Padrão | Extra |');
      lines.push('|---|---|---|---|---|---|');

      for (const c of columns.filter(x => x.TABLE_NAME === table.TABLE_NAME)) {
        lines.push(
          `| ${safe(c.COLUMN_NAME)} | ${safe(c.COLUMN_TYPE)} | ${c.IS_NULLABLE} | ${safe(c.COLUMN_KEY)} | ${safe(c.COLUMN_DEFAULT)} | ${safe(c.EXTRA)} |`
        );
      }
      lines.push('');
    }

    lines.push('## 3. Chaves estrangeiras');
    lines.push('');
    lines.push('| Tabela | Campo | Referência | Atualização | Exclusão |');
    lines.push('|---|---|---|---|---|');

    for (const fk of foreignKeys) {
      lines.push(
        `| ${safe(fk.TABLE_NAME)} | ${safe(fk.COLUMN_NAME)} | ${safe(fk.REFERENCED_TABLE_NAME)}.${safe(fk.REFERENCED_COLUMN_NAME)} | ${safe(fk.UPDATE_RULE)} | ${safe(fk.DELETE_RULE)} |`
      );
    }

    lines.push('');
    lines.push('## 4. Restrições CHECK');
    lines.push('');
    lines.push('| Tabela | Restrição | Regra |');
    lines.push('|---|---|---|');

    for (const c of checks) {
      lines.push(
        `| ${safe(c.TABLE_NAME)} | ${safe(c.CONSTRAINT_NAME)} | ${safe(c.CHECK_CLAUSE)} |`
      );
    }

    lines.push('');
    lines.push('## 5. Índices');
    lines.push('');
    lines.push('| Tabela | Índice | Não único | Colunas |');
    lines.push('|---|---|---|---|');

    for (const i of indexes) {
      lines.push(
        `| ${safe(i.TABLE_NAME)} | ${safe(i.INDEX_NAME)} | ${i.NON_UNIQUE ? 'Sim' : 'Não'} | ${safe(i.columns_list)} |`
      );
    }

    lines.push('');
    lines.push('## 6. Observações');
    lines.push('');
    lines.push('- Os dados foram obtidos diretamente dos metadados do MySQL.');
    lines.push('- As views representam consultas estruturadas e não tabelas físicas.');
    lines.push('- A normalização deve ser complementada pela análise das dependências funcionais e regras de negócio.');
    lines.push('');

    const docs = path.resolve(__dirname, '..', 'docs');
    fs.mkdirSync(docs, { recursive: true });

    fs.writeFileSync(
      path.join(docs, 'UC3-Dicionario-de-Dados.md'),
      lines.join('\n'),
      'utf8'
    );

    const [relations] = await db.execute(
      `SELECT TABLE_NAME, REFERENCED_TABLE_NAME
       FROM information_schema.KEY_COLUMN_USAGE
       WHERE CONSTRAINT_SCHEMA = ?
       AND REFERENCED_TABLE_NAME IS NOT NULL
       ORDER BY TABLE_NAME`,
      [dbName]
    );

    const physicalTables = tables.filter(t => t.TABLE_TYPE === 'BASE TABLE');
    const erd = ['erDiagram'];

    for (const table of physicalTables) {
      const name = table.TABLE_NAME;
      const fields = columns.filter(c => c.TABLE_NAME === name);
      erd.push(`    ${name.toUpperCase()} {`);
      for (const field of fields) {
        const key = field.COLUMN_KEY === 'PRI' ? ' PK' : '';
        erd.push(`        ${field.COLUMN_TYPE.replace(/[^a-zA-Z0-9]/g, '_')} ${field.COLUMN_NAME}${key}`);
      }
      erd.push('    }');
    }

    for (const rel of relations) {
      erd.push(
        `    ${rel.REFERENCED_TABLE_NAME.toUpperCase()} ||--o{ ${rel.TABLE_NAME.toUpperCase()} : relaciona`
      );
    }

    fs.writeFileSync(
      path.join(docs, 'UC3-Modelo-Relacional.mmd'),
      erd.join('\n') + '\n',
      'utf8'
    );

    console.log('\nDocumentação UC3 criada com sucesso!');
    console.log(`Estruturas: ${tables.length}`);
    console.log(`Tabelas físicas: ${physicalTables.length}`);
    console.log(`Chaves estrangeiras: ${foreignKeys.length}`);
    console.log(`Restrições CHECK: ${checks.length}`);
    console.log('\nArquivos criados em docs/:');
    console.log('- UC3-Dicionario-de-Dados.md');
    console.log('- UC3-Modelo-Relacional.mmd');
  } finally {
    await db.end();
  }
}

main().catch(error => {
  console.error('Erro ao gerar documentação:', error.message);
  process.exitCode = 1;
});

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const keys = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];

for (const key of keys) {
    if (!process.env[key]) {
        console.error(`Configuração ${key} ausente no .env.`);
        process.exit(1);
    }
}

const defaultDump = 'C:\\Program Files\\MySQL\\MySQL Server 8.4\\bin\\mysqldump.exe';
const dump = process.env.MYSQLDUMP_PATH ||
    (fs.existsSync(defaultDump) ? defaultDump : 'mysqldump');

const folder = path.resolve('backups');
fs.mkdirSync(folder, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const output = path.join(folder, `${process.env.DB_NAME}_${stamp}.sql`);

const args = [
    `--host=${process.env.DB_HOST}`,
    `--port=${process.env.DB_PORT}`,
    `--user=${process.env.DB_USER}`,
    '--single-transaction',
    '--routines',
    '--triggers',
    '--events',
    '--no-tablespaces',
    '--default-character-set=utf8mb4',
    `--result-file=${output}`,
    process.env.DB_NAME
];

const result = spawnSync(dump, args, {
    stdio: 'inherit',
    windowsHide: true,
    env: { ...process.env, MYSQL_PWD: process.env.DB_PASSWORD }
});

if (result.error || result.status !== 0) {
    if (fs.existsSync(output)) fs.unlinkSync(output);
    console.error('Falha ao criar backup. Confira o mysqldump e as permissões.');
    process.exit(1);
}

console.log(`Backup criado: ${output}`);

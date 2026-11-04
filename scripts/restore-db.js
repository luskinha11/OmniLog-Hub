require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const backup = process.argv[2];

if (!backup) {
    console.error('Uso: npm run db:restore:test -- backups/arquivo.sql');
    process.exit(1);
}

const file = path.resolve(backup);

if (!fs.existsSync(file) || !file.toLowerCase().endsWith('.sql')) {
    console.error('Arquivo SQL não encontrado.');
    process.exit(1);
}

const target = process.env.DB_RESTORE_TARGET || 'omnilog_hub_restore_test';

if (!target.endsWith('_restore_test') || target === process.env.DB_NAME) {
    console.error('Destino inválido. Use um banco terminado em _restore_test.');
    process.exit(1);
}

const mysql = process.env.MYSQL_PATH ||
    'C:\\Program Files\\MySQL\\MySQL Server 8.4\\bin\\mysql.exe';

if (!fs.existsSync(mysql)) {
    console.error('mysql.exe do MySQL 8.4 não encontrado.');
    process.exit(1);
}

const env = {
    ...process.env,
    MYSQL_PWD: process.env.DB_PASSWORD
};

const create = spawnSync(mysql, [
    `--host=${process.env.DB_HOST}`,
    `--port=${process.env.DB_PORT}`,
    `--user=${process.env.DB_USER}`,
    '--execute',
    `CREATE DATABASE IF NOT EXISTS \`${target}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci`
], { stdio: 'inherit', env, windowsHide: true });

if (create.error || create.status !== 0) {
    console.error('Não foi possível criar o banco de restauração.');
    process.exit(1);
}

const restore = spawnSync(mysql, [
    `--host=${process.env.DB_HOST}`,
    `--port=${process.env.DB_PORT}`,
    `--user=${process.env.DB_USER}`,
    target
], {
    input: fs.readFileSync(file),
    stdio: ['pipe', 'inherit', 'inherit'],
    env,
    windowsHide: true
});

if (restore.error || restore.status !== 0) {
    console.error('Falha na restauração de teste.');
    process.exit(1);
}

console.log(`Restauração concluída em ${target}.`);
console.log('O banco principal não foi sobrescrito.');

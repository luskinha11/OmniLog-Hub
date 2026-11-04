const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3307),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'omnilog_hub',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
  timezone: 'local'
});

async function testarConexao() {
  const [rows] = await pool.query('SELECT VERSION() AS version, DATABASE() AS database_name');
  return rows[0];
}

module.exports = { pool, testarConexao };

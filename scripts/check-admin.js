require('dotenv').config();
const { pool } = require('../src/config/database');

(async () => {
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (!email) {
    console.log('ADMIN_EMAIL não está definido no .env.');
    process.exitCode = 1;
    await pool.end();
    return;
  }
  try {
    const [rows] = await pool.execute(
      'SELECT email, role, active FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    if (!rows.length) {
      console.log(`Nenhuma conta encontrada para ${email}. Execute npm run seed:admin.`);
    } else {
      console.log(`Conta encontrada: ${rows[0].email} | Perfil: ${rows[0].role} | Ativa: ${rows[0].active ? 'sim' : 'não'}`);
    }
  } catch (error) {
    console.error('Não foi possível conferir a conta administrativa:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();

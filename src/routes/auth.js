const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const { pool } = require('../config/database');
const router = express.Router();
const registerLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });
const resetRequestLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: true, legacyHeaders: false });
const resetVerifyLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });

function validEmail(email) { return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

router.post('/register', registerLimiter, async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || String(name).trim().length < 2 || !validEmail(email) || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Informe nome, e-mail válido e senha com pelo menos 8 caracteres.' });
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(
      'INSERT INTO users (email,password_hash,role) VALUES (?,?,?)',
      [email.toLowerCase().trim(), await bcrypt.hash(password, 12), 'CUSTOMER']
    );
    await connection.execute('INSERT INTO customers (user_id,name) VALUES (?,?)', [result.insertId, String(name).trim()]);
    await connection.commit();
    const sessionUser = { id: result.insertId, email: email.toLowerCase().trim(), role: 'CUSTOMER', name: String(name).trim() };
    req.session.regenerate(err => {
      if (err) return res.status(500).json({ error: 'Conta criada, mas não foi possível iniciar a sessão. Faça login.' });
      req.session.user = sessionUser;
      req.session.save(saveError => {
        if (saveError) return res.status(500).json({ error: 'Conta criada, mas não foi possível iniciar a sessão. Faça login.' });
        res.status(201).json({ message: 'Cadastro realizado com sucesso.', user: sessionUser });
      });
    });
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
    console.error(error);
    res.status(500).json({ error: 'Não foi possível criar a conta.' });
  } finally { connection.release(); }
});

router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body || {};
  if (!validEmail(email) || typeof password !== 'string') return res.status(400).json({ error: 'Informe e-mail e senha.' });
  const [rows] = await pool.execute(
    `SELECT u.id,u.email,u.password_hash,u.role,c.name
     FROM users u LEFT JOIN customers c ON c.user_id=u.id
     WHERE u.email=? AND u.active=TRUE LIMIT 1`, [email.toLowerCase().trim()]
  );
  if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash))) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  }
  const user = rows[0];
  req.session.regenerate(err => {
    if (err) return res.status(500).json({ error: 'Não foi possível iniciar a sessão.' });
    req.session.user = { id: user.id, email: user.email, role: user.role, name: user.name || user.email };
    req.session.save(saveError => {
      if (saveError) return res.status(500).json({ error: 'Não foi possível salvar a sessão.' });
      res.json({ message: 'Login realizado.', user: req.session.user });
    });
  });
});

router.get('/me', (req, res) => res.json({ user: req.session.user || null }));
router.post('/logout', (req, res) => req.session.destroy(() => {
  res.clearCookie('omni.sid', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.json({ message: 'Sessão encerrada.' });
}));

router.post('/forgot-password', resetRequestLimiter, async (req, res) => {
  const email = String(req.body?.email || '').toLowerCase().trim();
  const generic = { message: 'Se o e-mail estiver cadastrado, enviaremos instruções para redefinir a senha.' };
  if (!validEmail(email)) return res.json(generic);
  const [users] = await pool.execute('SELECT id,email FROM users WHERE email=? AND active=TRUE LIMIT 1', [email]);
  if (!users.length) return res.json(generic);
  const user = users[0];
  await pool.execute('UPDATE password_reset_tokens SET used_at=NOW() WHERE user_id=? AND used_at IS NULL', [user.id]);
  const code = String(crypto.randomInt(100000, 1000000));
  const secret = process.env.RESET_TOKEN_SECRET || process.env.SESSION_SECRET || 'dev-only-secret';
  const tokenHash = crypto.createHmac('sha256', secret).update(`${user.id}:${code}`).digest('hex');
  await pool.execute('INSERT INTO password_reset_tokens (user_id,token_hash,expires_at) VALUES (?,?,DATE_ADD(NOW(),INTERVAL 10 MINUTE))', [user.id, tokenHash]);
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === 'true', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } });
    await transporter.sendMail({ from: process.env.EMAIL_FROM || process.env.SMTP_USER, to: user.email, subject: 'Código de recuperação - OmniLog Hub', text: `Seu código é ${code}. Ele expira em 10 minutos.` });
  } else if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV] Código de recuperação para ${user.email}: ${code}`);
  }
  res.json(generic);
});

router.post('/reset-password', resetVerifyLimiter, async (req, res) => {
  const email = String(req.body?.email || '').toLowerCase().trim();
  const code = String(req.body?.code || '').trim();
  const password = req.body?.password;
  if (!validEmail(email) || !/^\d{6}$/.test(code) || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Informe e-mail, código de 6 dígitos e nova senha com pelo menos 8 caracteres.' });
  }
  const [rows] = await pool.execute(
    `SELECT t.id,t.user_id,t.token_hash,u.email FROM password_reset_tokens t
     JOIN users u ON u.id=t.user_id
     WHERE u.email=? AND t.used_at IS NULL AND t.expires_at>NOW() AND t.attempts<5
     ORDER BY t.id DESC LIMIT 1`, [email]
  );
  if (!rows.length) return res.status(400).json({ error: 'Código inválido ou expirado.' });
  const token = rows[0];
  const secret = process.env.RESET_TOKEN_SECRET || process.env.SESSION_SECRET || 'dev-only-secret';
  const candidate = crypto.createHmac('sha256', secret).update(`${token.user_id}:${code}`).digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(token.token_hash))) {
    await pool.execute('UPDATE password_reset_tokens SET attempts=attempts+1 WHERE id=?', [token.id]);
    return res.status(400).json({ error: 'Código inválido ou expirado.' });
  }
  await pool.execute('UPDATE users SET password_hash=? WHERE id=?', [await bcrypt.hash(password, 12), token.user_id]);
  await pool.execute('UPDATE password_reset_tokens SET used_at=NOW() WHERE user_id=? AND used_at IS NULL', [token.user_id]);
  res.json({ message: 'Senha alterada com sucesso. Faça login novamente.' });
});

module.exports = router;

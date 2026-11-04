require('dotenv').config();
const bcrypt=require('bcryptjs');
const {pool}=require('../src/config/database');
(async()=>{
  const email=String(process.env.ADMIN_EMAIL||'').trim().toLowerCase();
  const password=String(process.env.ADMIN_PASSWORD||'');
  if(!email||password.length<12){console.error('Configure ADMIN_EMAIL e ADMIN_PASSWORD com pelo menos 12 caracteres no .env.');process.exitCode=1;await pool.end();return;}
  try{
    const hash=await bcrypt.hash(password,12);
    await pool.execute(`INSERT INTO users(email,password_hash,role,active) VALUES(?,?,'ADMIN',TRUE)
      ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash),role='ADMIN',active=TRUE`,[email,hash]);
    console.log(`Administrador configurado: ${email}`);
  }catch(error){console.error(error.message);process.exitCode=1;}finally{await pool.end();}
})();

require('dotenv').config();
const {testarConexao}=require('../src/config/database');
(async()=>{try{const result=await testarConexao();console.log('Conexão MySQL OK:',result);process.exit(0);}catch(error){console.error('Falha ao conectar ao MySQL:',error.message);process.exit(1);}})();

require('dotenv').config();
const express=require('express');
const path=require('path');
const session=require('express-session');
const rateLimit=require('express-rate-limit');
const {pool,testarConexao}=require('./config/database');
const authRoutes=require('./routes/auth');
const productRoutes=require('./routes/products');
const inventoryRoutes=require('./routes/inventory');
const orderRoutes=require('./routes/orders');
const deliveryRoutes=require('./routes/deliveries');
const adminRoutes=require('./routes/admin');

const app=express();
app.disable('x-powered-by');
app.use(express.json({limit:'1mb'}));
app.use(express.urlencoded({extended:false,limit:'1mb'}));
app.use(session({
  name:'omni.sid',
  secret:process.env.SESSION_SECRET||'development-only-change-me',
  resave:false,
  saveUninitialized:false,
  cookie:{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:1000*60*60*8}
}));
app.use('/api/auth',rateLimit({windowMs:15*60*1000,limit:100,standardHeaders:true,legacyHeaders:false}),authRoutes);
app.use('/api/products',productRoutes);
app.use('/api/inventory',inventoryRoutes);
app.use('/api/orders',orderRoutes);
app.use('/api/deliveries',deliveryRoutes);
app.use('/api/admin',adminRoutes);
app.get('/api/health',async(req,res)=>{
  try{const db=await testarConexao();res.json({status:'online',database:'connected',version:db.version});}
  catch(error){res.status(503).json({status:'offline',database:'disconnected',message:'Verifique as configurações do banco no arquivo .env'});}
});
app.use('/api',(req,res)=>res.status(404).json({error:'Rota da API não encontrada.'}));
app.use(express.static(path.join(__dirname,'..','public')));
app.get(/.*/,(req,res)=>res.sendFile(path.join(__dirname,'..','public','index.html')));
app.use((error,req,res,next)=>{
  console.error(error);
  if(res.headersSent)return next(error);
  const status=error.status||500;
  res.status(status).json({error:status===400?'Requisição inválida. Verifique os dados enviados.':'Erro interno do servidor.'});
});
const port=Number(process.env.PORT||3000);
const server=app.listen(port,()=>console.log(`OmniLog Hub disponível em http://localhost:${port}`));
async function shutdown(){
  server.close(async()=>{try{await pool.end();}finally{process.exit(0);}});
}
process.on('SIGINT',shutdown);
process.on('SIGTERM',shutdown);

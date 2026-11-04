const express=require('express');
const {pool}=require('../config/database');
const {requireRole}=require('../middleware/auth');
const router=express.Router();

router.get('/track/:code',async(req,res)=>{
  const [rows]=await pool.execute(`SELECT d.tracking_code,d.status,d.estimated_delivery,d.updated_at,o.order_number,o.status AS order_status
    FROM deliveries d JOIN sales_orders o ON o.id=d.order_id WHERE d.tracking_code=? LIMIT 1`,[String(req.params.code).toUpperCase()]);
  if(!rows.length)return res.status(404).json({error:'Código de rastreio não encontrado.'});
  res.json(rows[0]);
});

router.get('/',requireRole('ADMIN','MANAGER','OPERATOR'),async(req,res)=>{
  const [rows]=await pool.query(`SELECT d.id,d.tracking_code,d.status,d.updated_at,o.order_number,c.name AS customer
    FROM deliveries d JOIN sales_orders o ON o.id=d.order_id JOIN customers c ON c.id=o.customer_id ORDER BY d.updated_at DESC`);
  res.json(rows);
});

router.patch('/:id',requireRole('ADMIN','MANAGER','OPERATOR'),async(req,res)=>{
  const allowed=['PREPARING','IN_TRANSIT','DELIVERED','DELAYED'];
  const status=String(req.body?.status||'').toUpperCase();
  if(!allowed.includes(status))return res.status(400).json({error:'Status de entrega inválido.'});
  const connection=await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows]=await connection.execute(`SELECT d.id,d.order_id,d.status,o.status AS order_status
      FROM deliveries d JOIN sales_orders o ON o.id=d.order_id WHERE d.id=? FOR UPDATE`,[req.params.id]);
    if(!rows.length){await connection.rollback();return res.status(404).json({error:'Entrega não encontrada.'});}
    const delivery=rows[0];
    if(delivery.order_status==='CANCELLED')throw Object.assign(new Error('Não é possível atualizar a entrega de um pedido cancelado.'),{status:409});
    if(delivery.order_status==='DELIVERED' && status!=='DELIVERED')throw Object.assign(new Error('Uma entrega concluída não pode voltar para outra etapa.'),{status:409});
    if(status==='DELIVERED' && delivery.status!=='DELIVERED'){
      const [allocations]=await connection.execute(`SELECT a.inventory_id,a.quantity FROM order_item_allocations a
        JOIN order_items oi ON oi.id=a.order_item_id WHERE oi.order_id=? FOR UPDATE`,[delivery.order_id]);
      for(const allocation of allocations){
        await connection.execute('UPDATE inventory SET quantity=quantity-?,reserved_quantity=GREATEST(reserved_quantity-?,0) WHERE id=? AND quantity>=?',[allocation.quantity,allocation.quantity,allocation.inventory_id,allocation.quantity]);
      }
    }
    await connection.execute(`UPDATE deliveries SET status=?,delivered_at=IF(?='DELIVERED',NOW(),delivered_at) WHERE id=?`,[status,status,req.params.id]);
    if(status==='DELIVERED') await connection.execute("UPDATE sales_orders SET status='DELIVERED' WHERE id=?",[delivery.order_id]);
    else if(status==='IN_TRANSIT'||status==='DELAYED') await connection.execute("UPDATE sales_orders SET status='SHIPPED' WHERE id=? AND status<>'DELIVERED'",[delivery.order_id]);
    else await connection.execute("UPDATE sales_orders SET status='SEPARATING' WHERE id=? AND status NOT IN ('DELIVERED','CANCELLED')",[delivery.order_id]);
    await connection.commit();
    res.json({message:'Entrega atualizada com sucesso.'});
  }catch(error){
    await connection.rollback();
    res.status(error.status||500).json({error:error.status?error.message:'Não foi possível atualizar a entrega.'});
    if(!error.status)console.error(error);
  }finally{connection.release();}
});
module.exports=router;

const express = require('express');
const crypto = require('crypto');
const { pool } = require('../config/database');
const { requireAuth, requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/', requireRole('ADMIN','MANAGER','OPERATOR'), async (req,res) => {
  const [rows] = await pool.query(`SELECT o.id,o.order_number,o.status,o.total,o.created_at,c.name AS customer
    FROM sales_orders o JOIN customers c ON c.id=o.customer_id ORDER BY o.created_at DESC LIMIT 200`);
  res.json(rows);
});

router.get('/mine', requireAuth, async (req,res) => {
  if (req.session.user.role !== 'CUSTOMER') return res.json([]);
  const [rows] = await pool.execute(`SELECT o.id,o.order_number,o.status,o.total,o.created_at,d.tracking_code,d.status AS delivery_status
    FROM sales_orders o JOIN customers c ON c.id=o.customer_id LEFT JOIN deliveries d ON d.order_id=o.id
    WHERE c.user_id=? ORDER BY o.created_at DESC`,[req.session.user.id]);
  res.json(rows);
});

router.post('/', requireRole('CUSTOMER'), async (req,res) => {
  const items = req.body?.items;
  if (!Array.isArray(items) || items.length<1 || items.length>20) return res.status(400).json({error:'Envie de 1 a 20 itens.'});
  const aggregated = new Map();
  for (const item of items) {
    const id=Number(item.product_id), quantity=Number(item.quantity);
    if (!Number.isInteger(id)||id<=0||!Number.isInteger(quantity)||quantity<=0||quantity>100) return res.status(400).json({error:'Produto ou quantidade inválidos.'});
    aggregated.set(id,(aggregated.get(id)||0)+quantity);
    if (aggregated.get(id)>100) return res.status(400).json({error:'O limite é de 100 unidades por produto.'});
  }
  const connection=await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[customer]] = await connection.execute('SELECT id FROM customers WHERE user_id=? FOR UPDATE',[req.session.user.id]);
    if (!customer) throw Object.assign(new Error('Cadastro de cliente não encontrado.'),{status:400});
    const products=[];
    let totalCents=0;
    for (const [productId,quantity] of aggregated) {
      const [pRows]=await connection.execute('SELECT id,name,price FROM products WHERE id=? AND active=TRUE FOR UPDATE',[productId]);
      if (!pRows.length) throw Object.assign(new Error('Produto não encontrado ou indisponível.'),{status:400});
      const priceCents=Math.round(Number(pRows[0].price)*100);
      totalCents += priceCents*quantity;
      products.push({product:pRows[0],quantity,priceCents});
    }
    const orderNumber=`OMNI-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const [orderResult]=await connection.execute('INSERT INTO sales_orders (customer_id,order_number,total) VALUES (?,?,?)',[customer.id,orderNumber,totalCents/100]);
    for (const item of products) {
      const [itemResult]=await connection.execute('INSERT INTO order_items (order_id,product_id,quantity,unit_price) VALUES (?,?,?,?)',[orderResult.insertId,item.product.id,item.quantity,item.priceCents/100]);
      let remaining=item.quantity;
      const [stocks]=await connection.execute(`SELECT id,quantity,reserved_quantity,(quantity-reserved_quantity) AS available
        FROM inventory WHERE product_id=? AND quantity>reserved_quantity ORDER BY warehouse_id FOR UPDATE`,[item.product.id]);
      for (const stock of stocks) {
        if (!remaining) break;
        const take=Math.min(remaining,Number(stock.available));
        if (take>0) {
          await connection.execute('UPDATE inventory SET reserved_quantity=reserved_quantity+? WHERE id=?',[take,stock.id]);
          await connection.execute('INSERT INTO order_item_allocations (order_item_id,inventory_id,quantity) VALUES (?,?,?)',[itemResult.insertId,stock.id,take]);
          remaining-=take;
        }
      }
      if (remaining>0) throw Object.assign(new Error(`Estoque insuficiente para ${item.product.name}.`),{status:409});
    }
    const tracking=`OMNI-${new Date().getFullYear()}-${String(orderResult.insertId).padStart(6,'0')}`;
    await connection.execute('INSERT INTO deliveries (order_id,tracking_code,status) VALUES (?,?,?)',[orderResult.insertId,tracking,'PREPARING']);
    await connection.commit();
    res.status(201).json({message:'Pedido criado e estoque reservado.',order:{id:orderResult.insertId,order_number:orderNumber,total:totalCents/100,tracking_code:tracking}});
  } catch(error) {
    await connection.rollback();
    res.status(error.status||500).json({error:error.status?error.message:'Não foi possível criar o pedido.'});
    if (!error.status) console.error(error);
  } finally { connection.release(); }
});

router.patch('/:id/status', requireRole('ADMIN','MANAGER','OPERATOR'), async (req,res) => {
  const allowed=['PENDING','CONFIRMED','SEPARATING','SHIPPED','DELIVERED','CANCELLED'];
  const status=String(req.body?.status||'').toUpperCase();
  if (!allowed.includes(status)) return res.status(400).json({error:'Status de pedido inválido.'});
  const connection=await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [orders]=await connection.execute('SELECT id,status FROM sales_orders WHERE id=? FOR UPDATE',[req.params.id]);
    if (!orders.length) { await connection.rollback(); return res.status(404).json({error:'Pedido não encontrado.'}); }
    const oldStatus=orders[0].status;
    if (oldStatus==='CANCELLED' && status!=='CANCELLED') throw Object.assign(new Error('Um pedido cancelado não pode ser reaberto.'),{status:409});
    if (oldStatus==='DELIVERED' && status!=='DELIVERED') throw Object.assign(new Error('Um pedido entregue não pode voltar para uma etapa anterior.'),{status:409});

    if (status==='CANCELLED' && oldStatus!=='CANCELLED') {
      const [allocations]=await connection.execute(`SELECT a.inventory_id,a.quantity FROM order_item_allocations a
        JOIN order_items oi ON oi.id=a.order_item_id WHERE oi.order_id=? FOR UPDATE`,[req.params.id]);
      for (const allocation of allocations) {
        await connection.execute('UPDATE inventory SET reserved_quantity=GREATEST(reserved_quantity-?,0) WHERE id=?',[allocation.quantity,allocation.inventory_id]);
      }
    }
    if (status==='DELIVERED' && oldStatus!=='DELIVERED') {
      const [allocations]=await connection.execute(`SELECT a.inventory_id,a.quantity FROM order_item_allocations a
        JOIN order_items oi ON oi.id=a.order_item_id WHERE oi.order_id=? FOR UPDATE`,[req.params.id]);
      for (const allocation of allocations) {
        await connection.execute('UPDATE inventory SET quantity=quantity-?,reserved_quantity=GREATEST(reserved_quantity-?,0) WHERE id=? AND quantity>=?',[allocation.quantity,allocation.quantity,allocation.inventory_id,allocation.quantity]);
      }
      await connection.execute("UPDATE deliveries SET status='DELIVERED',delivered_at=NOW() WHERE order_id=?",[req.params.id]);
    } else if (status==='SHIPPED') {
      await connection.execute("UPDATE deliveries SET status='IN_TRANSIT' WHERE order_id=? AND status<>'DELIVERED'",[req.params.id]);
    }
    await connection.execute('UPDATE sales_orders SET status=? WHERE id=?',[status,req.params.id]);
    await connection.commit();
    res.json({message:'Status do pedido atualizado.'});
  } catch(error) {
    await connection.rollback();
    res.status(error.status||500).json({error:error.status?error.message:'Não foi possível atualizar o pedido.'});
    if (!error.status) console.error(error);
  } finally { connection.release(); }
});

module.exports=router;

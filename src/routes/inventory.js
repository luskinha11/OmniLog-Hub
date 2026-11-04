const express = require('express');
const { pool } = require('../config/database');
const { requireRole } = require('../middleware/auth');
const router = express.Router();
router.get('/', async (req,res) => {
  const [rows] = await pool.query(`SELECT i.id,w.name AS warehouse,p.id AS product_id,p.name AS product,
    i.quantity,i.reserved_quantity,(i.quantity-i.reserved_quantity) AS available,i.updated_at
    FROM inventory i JOIN warehouses w ON w.id=i.warehouse_id JOIN products p ON p.id=i.product_id
    ORDER BY w.name,p.name`);
  res.json(rows);
});
router.put('/:id', requireRole('ADMIN','MANAGER','OPERATOR'), async (req,res) => {
  const quantity = Number(req.body?.quantity);
  if (!Number.isInteger(quantity) || quantity<0) return res.status(400).json({error:'Quantidade inválida.'});
  const [rows] = await pool.execute('SELECT id,reserved_quantity FROM inventory WHERE id=?',[req.params.id]);
  if (!rows.length) return res.status(404).json({error:'Registro de estoque não encontrado.'});
  if (quantity < Number(rows[0].reserved_quantity)) return res.status(400).json({error:'A quantidade não pode ser menor que o estoque reservado.'});
  await pool.execute('UPDATE inventory SET quantity=? WHERE id=?',[quantity,req.params.id]);
  res.json({message:'Estoque atualizado.'});
});
module.exports = router;

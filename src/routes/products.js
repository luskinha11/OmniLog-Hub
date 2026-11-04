const express = require('express');
const { pool } = require('../config/database');
const { requireRole } = require('../middleware/auth');
const router = express.Router();

router.get('/manage', requireRole('ADMIN','MANAGER'), async (req,res) => {
  const [rows] = await pool.query(`SELECT p.id,p.category_id,p.name,p.description,p.price,p.weight,p.active,c.name AS category
    FROM products p JOIN categories c ON c.id=p.category_id ORDER BY p.active DESC,p.name`);
  res.json(rows);
});

router.get('/', async (req, res) => {
  const [rows] = await pool.query(`SELECT p.id,p.name,p.description,p.price,p.weight,c.name AS category,
    COALESCE(SUM(i.quantity-i.reserved_quantity),0) AS available_stock
    FROM products p JOIN categories c ON c.id=p.category_id
    LEFT JOIN inventory i ON i.product_id=p.id
    WHERE p.active=TRUE GROUP BY p.id,c.name ORDER BY p.name`);
  res.json(rows);
});

router.post('/', requireRole('ADMIN','MANAGER'), async (req,res) => {
  const { category_id, name, description='', price, weight=0 } = req.body || {};
  if (!Number.isInteger(Number(category_id)) || Number(category_id)<=0 || !String(name || '').trim() || !Number.isFinite(Number(price)) || Number(price)<0 || !Number.isFinite(Number(weight)) || Number(weight)<0) return res.status(400).json({error:'Dados do produto inválidos.'});
  const [result] = await pool.execute('INSERT INTO products (category_id,name,description,price,weight) VALUES (?,?,?,?,?)',[category_id,String(name).trim(),description,Number(price),Number(weight)||0]);
  res.status(201).json({id:result.insertId,message:'Produto criado.'});
});

router.put('/:id', requireRole('ADMIN','MANAGER'), async (req,res) => {
  const { category_id, name, description='', price, weight=0, active=true } = req.body || {};
  if (!Number.isInteger(Number(category_id)) || Number(category_id)<=0 || !String(name || '').trim() || !Number.isFinite(Number(price)) || Number(price)<0 || !Number.isFinite(Number(weight)) || Number(weight)<0) return res.status(400).json({error:'Dados do produto inválidos.'});
  const productId = Number(req.params.id);
  if (!Number.isInteger(productId) || productId<=0) return res.status(400).json({error:'Identificador de produto inválido.'});
  const [result] = await pool.execute('UPDATE products SET category_id=?,name=?,description=?,price=?,weight=?,active=? WHERE id=?',[category_id,String(name).trim(),description,Number(price),Number(weight)||0,Boolean(active),productId]);
  if (!result.affectedRows) {
    const [existing] = await pool.execute('SELECT id FROM products WHERE id=?',[productId]);
    if (!existing.length) return res.status(404).json({error:'Produto não encontrado.'});
  }
  res.json({message:'Produto atualizado.'});
});

router.delete('/:id', requireRole('ADMIN','MANAGER'), async (req,res) => {
  const productId = Number(req.params.id);
  if (!Number.isInteger(productId) || productId<=0) return res.status(400).json({error:'Identificador de produto inválido.'});
  const [result] = await pool.execute('UPDATE products SET active=FALSE WHERE id=?',[productId]);
  if (!result.affectedRows) {
    const [existing] = await pool.execute('SELECT id FROM products WHERE id=?',[productId]);
    if (!existing.length) return res.status(404).json({error:'Produto não encontrado.'});
  }
  res.json({message:'Produto desativado.'});
});
module.exports = router;

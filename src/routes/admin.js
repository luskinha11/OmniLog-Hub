const express=require('express');
const {pool}=require('../config/database');
const {requireRole}=require('../middleware/auth');
const router=express.Router();
router.get('/summary',requireRole('ADMIN','MANAGER','OPERATOR'),async(req,res)=>{
  const [[products]]=await pool.query('SELECT COUNT(*) AS total FROM products WHERE active=TRUE');
  const [[orders]]=await pool.query('SELECT COUNT(*) AS total FROM sales_orders');
  const [[customers]]=await pool.query('SELECT COUNT(*) AS total FROM customers');
  const [[stock]]=await pool.query('SELECT COALESCE(SUM(quantity-reserved_quantity),0) AS total FROM inventory');
  const [[revenue]]=await pool.query("SELECT COALESCE(SUM(total),0) AS total FROM sales_orders WHERE status<>'CANCELLED'");
  res.json({products:products.total,orders:orders.total,customers:customers.total,available_units:stock.total,orders_value:revenue.total});
});
router.get('/categories',requireRole('ADMIN','MANAGER','OPERATOR'),async(req,res)=>{const [rows]=await pool.query('SELECT id,name FROM categories ORDER BY name');res.json(rows);});
router.get('/inventory-summary',requireRole('ADMIN','MANAGER','OPERATOR'),async(req,res)=>{const [rows]=await pool.query('SELECT * FROM vw_inventory_summary ORDER BY warehouse');res.json(rows);});
module.exports=router;

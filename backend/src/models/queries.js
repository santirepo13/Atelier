const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

function loadSQL(dir) {
  const map = {};
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    if (file.endsWith('.sql')) {
      const name = path.basename(file, '.sql');
      map[name] = fs.readFileSync(path.join(dir, file), 'utf8').trim();
    }
  });
  return map;
}

const queries = {
  products: loadSQL(path.join(__dirname, '../../../database/products')),
  cart: loadSQL(path.join(__dirname, '../../../database/cart')),
  orders: loadSQL(path.join(__dirname, '../../../database/orders')),
  users: loadSQL(path.join(__dirname, '../../../database/users')),
  admin: loadSQL(path.join(__dirname, '../../../database/adminQueries'))
};

async function dbQuery(sql, params) {
  const result = await pool.query(sql, params);
  return result;
}

module.exports = { queries, dbQuery };
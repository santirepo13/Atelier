const express = require('express');
const productsCtrl = require('../controllers/products');
const router = express.Router();

router.get('/', productsCtrl.getAll);
router.get('/:id', productsCtrl.getById);

module.exports = router;
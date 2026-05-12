const express = require('express');
const auth = require('../middleware/auth');
const cartCtrl = require('../controllers/cart');
const router = express.Router();

router.use(auth);
router.get('/', cartCtrl.getItems);
router.post('/items', cartCtrl.addItem);
router.put('/items/:itemId', cartCtrl.updateItem);
router.delete('/items/:itemId', cartCtrl.deleteItem);
router.get('/total', cartCtrl.getTotal);

module.exports = router;
const express = require('express');
const auth = require('../middleware/auth');
const ordersCtrl = require('../controllers/orders');
const router = express.Router();

router.use(auth);
router.post('/', ordersCtrl.create);
router.get('/', ordersCtrl.getOrders);
router.get('/:id', ordersCtrl.getOrder);

module.exports = router;
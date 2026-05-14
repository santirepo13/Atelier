const express = require('express');
const auth = require('../middleware/auth');
const usersCtrl = require('../controllers/users');
const router = express.Router();

router.get('/by-username/:username', usersCtrl.getByUsername);
router.use(auth);
router.post('/', usersCtrl.create);
router.get('/profile', usersCtrl.getProfile);
router.post('/2auth', usersCtrl.validateClave);

module.exports = router;
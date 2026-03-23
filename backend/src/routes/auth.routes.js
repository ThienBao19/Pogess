const express = require('express');
const router = express.Router();
const { register, login, logout, me, refreshToken } = require('../controllers/auth.controller');
const authenticate = require('../middleware/authenticate');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.post('/refresh', refreshToken);
router.get('/me', authenticate, me);

module.exports = router;

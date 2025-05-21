const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const authController = require('../controllers/authController');
require('dotenv').config();
const {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN
} = process.env;
const authMiddleware = require('../middlewares/authMiddleware');
const refreshTokens = new Map(); // Lưu refresh token tạm thời

router.post('/register', authController.register);

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const payload = { sub: user._id, role: user.role };
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });

  refreshTokens.set(refreshToken, user._id.toString());
  res.json({ accessToken, refreshToken });
});

router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken || !refreshTokens.has(refreshToken)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const accessToken = jwt.sign({ sub: payload.sub, role: payload.role }, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
    res.json({ accessToken });
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
});

router.post('/logout', (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken && refreshTokens.has(refreshToken)) {
    refreshTokens.delete(refreshToken);
  }
  res.json({ message: 'Logged out successfully' });
});

router.put('/user', authMiddleware, authController.updateUser);
// Xoá user (yêu cầu đăng nhập)
router.delete('/user', authMiddleware, authController.deleteUser);

router.get('/users', authMiddleware, authController.getUsers);
module.exports = router;

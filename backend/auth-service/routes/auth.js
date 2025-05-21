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
const roleMiddleware = require('../middlewares/roleMiddleware');
const nodemailer = require('nodemailer');

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post('/register', authController.register);

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Sai tài khoản hoặc mật khẩu' });
  }
  if (!user.isVerified) {
    return res.status(403).json({ message: 'Bạn cần xác thực email trước khi đăng nhập.' });
  }

  const payload = { sub: user._id, role: user.role };
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });

  refreshTokens.set(refreshToken, user._id.toString());
  res.json({ accessToken, refreshToken, payload });
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
router.post('/verify-email', async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.isVerified) return res.status(400).json({ message: 'Already verified' });
  if (user.verifyCode !== code) return res.status(400).json({ message: 'Invalid code' });
  if (user.verifyCodeExpires < Date.now()) return res.status(400).json({ message: 'Code expired' });

  user.isVerified = true;
  user.verifyCode = undefined;
  user.verifyCodeExpires = undefined;
  await user.save();
  res.json({ message: 'Email verified successfully' });
});

router.post('/resend-verify-email', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.isVerified) return res.status(400).json({ message: 'Already verified' });

  // Tạo mã mới và hạn mới
  const code = generateCode();
  const codeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

  user.verifyCode = code;
  user.verifyCodeExpires = codeExpires;
  await user.save();

  // Gửi email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Mã xác thực tài khoản mới",
    text: `Mã xác thực mới của bạn là: ${code}`
  });

  res.json({ message: "Đã gửi lại mã xác thực mới qua email!" });
});

module.exports = router;

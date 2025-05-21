const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer'); // npm install nodemailer
require('dotenv').config();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';
const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

const generateToken = (payload, secret, expiresIn) => {
    return jwt.sign(payload, secret, { expiresIn });
};

function generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 số
}

exports.register = async (req, res) => {
    try {
        const { email, fullName, password, phone } = req.body; // Thêm phone
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(409).json({ message: 'Email already exists' });

        const code = generateCode();
        const codeExpires = new Date(Date.now() + 10 * 60 * 1000); // hết hạn sau 10 phút

        const user = new User({
            email, fullName, password, phone,
            role: 'user',
            isVerified: false,
            verifyCode: code,
            verifyCodeExpires: codeExpires
        });
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
            subject: "Mã xác thực tài khoản",
            text: `Mã xác thực của bạn là: ${code}`
        });

        res.status(201).json({ message: 'User created. Please verify your email.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const payload = { id: user._id, email: user.email, role: user.role };
        const accessToken = generateToken(payload, ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRES_IN);
        const refreshToken = generateToken(payload, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRES_IN);

        res.status(200).json({ accessToken, refreshToken });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.refreshToken = (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Missing refresh token' });

    try {
        const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        const newAccessToken = generateToken({ id: payload.id, email: payload.email, role: payload.role }, ACCESS_TOKEN_SECRET, ACCESS_TOKEN_EXPIRES_IN);
        res.json({ accessToken: newAccessToken });
    } catch (err) {
        res.status(403).json({ message: 'Invalid refresh token' });
    }
};
exports.updateUser = async (req, res) => {
    try {
        const userId = req.user.sub;
        const { fullName, email, phone } = req.body; // Thêm phone
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { fullName, email, phone }, // Thêm phone
            { new: true, runValidators: true }
        );
        res.json({ message: "User updated", user: updatedUser });
    } catch (err) {
        res.status(400).json({ message: "Update failed", error: err.message });
    }
};

// Xoá user
exports.deleteUser = async (req, res) => {
    try {
        const userId = req.user.sub; // Lấy từ middleware xác thực JWT
        await User.findByIdAndDelete(userId);
        res.json({ message: "User deleted" });
    } catch (err) {
        res.status(400).json({ message: "Delete failed", error: err.message });
    }
};
exports.getUsers = async (req, res) => {
    try {
        // Nếu là admin, trả về tất cả user
        if (req.user.role === 'admin') {
            const users = await User.find().select('-password');
            return res.json(users);
        }
        // Nếu là user thường, chỉ trả về thông tin của chính họ
        const user = await User.findById(req.user.sub).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
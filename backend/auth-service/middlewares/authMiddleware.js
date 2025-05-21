const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET } = process.env;

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log('authHeader', authHeader);
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Missing token' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(410).set({
                'Cache-Control': 'no-store',
                'Pragma': 'no-cache'
            }).json({ message: 'Token expired' });
        }
        res.status(401).json({ message: 'Invalid token' });
    }
};

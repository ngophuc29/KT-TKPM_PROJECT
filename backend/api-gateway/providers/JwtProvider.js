import JWT from 'jsonwebtoken';

const generateToken = (payload, secretSignature, tokenLife) => {
    return JWT.sign(payload, secretSignature, {
        algorithm: 'HS256',
        expiresIn: tokenLife,
    });
};

const verifyToken = (token, secretSignature) => {
    try {
        if (!token) throw new Error('Token is missing');
        return JWT.verify(token, secretSignature);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('jwt expired');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new Error('invalid token');
        }
        throw error;
    }
};

// Secret từ biến môi trường
export const ACCESS_TOKEN_SECRET_SIGNATURE = process.env.ACCESS_TOKEN_SECRET_SIGNATURE;
export const REFRESH_TOKEN_SECRET_SIGNATURE = process.env.REFRESH_TOKEN_SECRET_SIGNATURE;


export const JwtProvider = {
    generateToken,
    verifyToken,
};

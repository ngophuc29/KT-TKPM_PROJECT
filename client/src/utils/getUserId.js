import { jwtDecode } from 'jwt-decode';

export const getUserId = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    
    try {
        const decoded = jwtDecode(token);
        return decoded.sub;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}; 
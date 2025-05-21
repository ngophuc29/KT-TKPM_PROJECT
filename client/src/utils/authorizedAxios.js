import axios from 'axios';
import { toast } from 'react-toastify';
import { handleLogoutAPI, refreshTokenAPI } from '../apis';

const authorizedAxiosInstance = axios.create({
    timeout: 1000 * 60 * 10,
    withCredentials: false, // Bạn đang dùng Authorization header, không cần cookie
});

authorizedAxiosInstance.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        config.headers.authorization = `Bearer ${accessToken}`;
    }
    return config;
}, (error) => Promise.reject(error));

let refreshTokenPromise = null;

authorizedAxiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 410 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (!refreshTokenPromise) {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    try {
                        await handleLogoutAPI();
                    } catch { }
                    window.location.href = '/login';
                    return Promise.reject(error);
                }

                refreshTokenPromise = refreshTokenAPI(refreshToken)
                    .then((res) => {
                        const { accessToken } = res.data;
                        localStorage.setItem('accessToken', accessToken);
                    })
                    .catch(async (_error) => {
                        try {
                            await handleLogoutAPI();
                        } catch { }
                        window.location.href = '/login';
                        return Promise.reject(_error);
                    })
                    .finally(() => {
                        refreshTokenPromise = null;
                    });
            }

            await refreshTokenPromise;
            const newAccessToken = localStorage.getItem('accessToken');
            if (newAccessToken) {
                originalRequest.headers.authorization = `Bearer ${newAccessToken}`;
            }
            return authorizedAxiosInstance(originalRequest);
        }

        if (error.response?.status === 401) {
            try {
                await handleLogoutAPI();
            } catch { }
            window.location.href = '/login';
            return Promise.reject(error);
        }

        if (error.response?.status !== 410) {
            toast.error(error.response?.data?.message || error?.message);
        }

        return Promise.reject(error);
    }
);

export default authorizedAxiosInstance;

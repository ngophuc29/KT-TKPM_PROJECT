import authorizedAxiosInstance from "../utils/authorizedAxios"


export const handleLogoutAPI = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    return await authorizedAxiosInstance.post(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/auth/logout`, {
        refreshToken
    });

}


export const refreshTokenAPI = async (refreshToken) => {

    return await authorizedAxiosInstance.post(`${import.meta.env.VITE_APP_API_GATEWAY_URL}/auth/refresh`, { refreshToken })

}
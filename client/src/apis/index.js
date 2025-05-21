import authorizedAxiosInstance from "../utils/authorizedAxios"


export const handleLogoutAPI = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    return await authorizedAxiosInstance.post('http://localhost:3000/api/auth/logout', {
        refreshToken
    });

}


export const refreshTokenAPI = async (refreshToken) => {

    return await authorizedAxiosInstance.post(`http://localhost:3000/api/auth/refresh`, { refreshToken })

}
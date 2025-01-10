import axios from 'axios';

const httpRequest = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_URL,
});

export const get = async (path, params = {}) => {
    const response = await httpRequest.get(path, params);

    return response.data;
};

export default httpRequest;

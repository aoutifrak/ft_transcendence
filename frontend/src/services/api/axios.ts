import axios, {CanceledError} from 'axios';

const BASE_URL = process.env.VITE_BACKEND_API_URL + "/api/";
axios.defaults.withCredentials = true;

export const axiosPrivate =  axios.create({
    baseURL: BASE_URL,
    headers: {'Content-Type' : 'application/json', },
});
export default axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type' : 'application/json',
    },
});


export {CanceledError};
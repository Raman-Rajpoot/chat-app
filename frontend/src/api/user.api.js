import axios from 'axios';

const userAPI = axios.create({
  baseURL: 'http://localhost:8000/user',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000,
  withCredentials: true
});


userAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default userAPI;

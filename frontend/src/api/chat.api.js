import axios from 'axios';

const chatAPI = axios.create({
  baseURL: 'http://localhost:8000/chat',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000,
  withCredentials: true
});

// Attach interceptor to chatAPI
chatAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default chatAPI;

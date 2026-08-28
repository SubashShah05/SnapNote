import axios from "axios";

const BACKEND_URL = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:4004/api/v1" 
});

BACKEND_URL.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

BACKEND_URL.interceptors.response.use(
    (response) => response,
    (error) => {
        // Global API Error Handling
        if (error.response) {
            const status = error.response.status;
            if (status === 401) {
                // Clear invalid authentication state
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                // Don't redirect immediately if on login page
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            } else if (status === 403) {
                console.error("Access forbidden");
            } else if (status === 429) {
                console.error("Rate limit exceeded. Please slow down.");
            } else if (status >= 500) {
                console.error("Server error. Please try again later.");
            }
        }
        return Promise.reject(error);
    }
);

export default BACKEND_URL;
import axios from 'axios';

// Create Axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add Auth Token
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage (or where authService stores it)
        // We need to be careful about circular dependencies if we import authService here
        // So we'll read directly from localStorage or similar mechanism
        try {
            const sessionStr = localStorage.getItem('sb-pjgjusdmzxrhgiptfvbg-auth-token'); // Supabase default key pattern?
            // Or checking how authService stores it. 
            // In the NEW authService, we will store the session/token explicitly.
            // Let's assume we store 'auth_token' or use the supabase session.

            // However, if we are completely replacing Supabase Client in Frontend for Auth, 
            // we should store our own token.
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                // But our updated AuthController returns { token } 
                // And we plan to store it.
                // Let's assume we store 'token' in localStorage.
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        } catch (error) {
            console.error('Error attaching token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized (e.g., logout or refresh token)
            // For 3-tier simple auth, maybe just clear storage and redirect
            // window.location.href = '/login'; // simplified
        }
        return Promise.reject(error);
    }
);

export default api;

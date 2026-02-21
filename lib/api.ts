import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Create Axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Track if we're currently refreshing to avoid infinite loops
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request interceptor to add Auth Token
api.interceptors.request.use(
    (config) => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
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

// Response interceptor with token refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Only attempt refresh on 401 errors and if we haven't already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Don't try to refresh if this IS a refresh request (avoid infinite loop)
            if (originalRequest.url?.includes('/auth/refresh')) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    originalRequest._retry = true; // Mark as retried to avoid infinite loops
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refresh_token');

            if (!refreshToken) {
                isRefreshing = false;
                // No refresh token, clear session
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('refresh_token');
                window.dispatchEvent(new Event('auth-change'));
                return Promise.reject(error);
            }

            try {
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
                    { refresh_token: refreshToken }
                );

                if (response.data.success) {
                    const { token, refresh_token: newRefreshToken, expires_at } = response.data.data;

                    // Update stored tokens
                    localStorage.setItem('token', token);
                    localStorage.setItem('refresh_token', newRefreshToken);
                    if (expires_at) {
                        localStorage.setItem('token_expires_at', expires_at.toString());
                    }

                    // Update the original request with new token
                    originalRequest.headers.Authorization = `Bearer ${token}`;

                    // Process any queued requests
                    processQueue(null, token);

                    isRefreshing = false;

                    // Retry the original request
                    return api(originalRequest);
                } else {
                    throw new Error('Refresh failed');
                }
            } catch (refreshError) {
                processQueue(refreshError as Error, null);
                isRefreshing = false;

                // Clear session on refresh failure
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('token_expires_at');
                window.dispatchEvent(new Event('auth-change'));

                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export default api;

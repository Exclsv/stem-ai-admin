import axios from 'axios';
import * as authHelper from '../modules/auth/core/AuthHelpers';

const API_URL = import.meta.env.VITE_APP_API_URL;

const apiClient = axios.create({
	baseURL: API_URL,
	timeout: 100000,
});

const getStoredTokens = () => {
	const tokenString = localStorage.getItem('kt-auth-react-v');
	if (!tokenString) return null;
	try {
		return JSON.parse(tokenString);
	} catch {
		return null;
	}
};

const setStoredTokens = (tokens: any) => {
	localStorage.setItem('kt-auth-react-v', JSON.stringify(tokens));
};

export const clearAuth = () => {
	localStorage.removeItem('kt-auth-react-v');
};

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	failedQueue = [];
};

export const setupApiClient = () => {
	apiClient.interceptors.request.use(
		(config) => {
			const tokens = getStoredTokens();
			if (tokens?.access) {
				config.headers.Authorization = `Bearer ${tokens.access}`;
			}
			return config;
		},
		(error) => Promise.reject(error)
	);

	apiClient.interceptors.response.use(
		(response) => response,
		async (error) => {
			const originalRequest = error.config;

			// Проверка если access token истек и не пытаемся повторно уже
			if (error.response?.status === 401 && !originalRequest._retry) {
				originalRequest._retry = true;

				const tokens = getStoredTokens();
				if (!tokens?.refresh) {
					clearAuth();
					window.location.href = '/login';
					return Promise.reject(error);
				}

				if (isRefreshing) {
					return new Promise((resolve, reject) => {
						failedQueue.push({ resolve, reject });
					}).then((token) => {
						originalRequest.headers.Authorization = `Bearer ${token}`;
						return apiClient(originalRequest);
					});
				}

				isRefreshing = true;

				try {
					const response = await axios.post(`${API_URL}/auth/jwt/refresh/`, {
						refresh: tokens.refresh,
					});

					const newAccess = response.data.access;
					const newTokens = { ...tokens, access: newAccess };
					setStoredTokens(newTokens);

					apiClient.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
					processQueue(null, newAccess);

					return apiClient(originalRequest);
				} catch (err) {
					processQueue(err, null);
					clearAuth();
					window.location.href = '/login';
					return Promise.reject(err);
				} finally {
					isRefreshing = false;
				}
			}

			return Promise.reject(error);
		}
	);
};

export default apiClient;

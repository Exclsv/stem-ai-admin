import { ApiError } from '../../_metronic/helpers';
import apiClient from '../hooks/apiClient';

export const getNews = async (queryParams: string) => {
	try {
		const response = await apiClient.get(`/news${queryParams}`);
		return response.data;
	} catch (error) {
		const apiError = error as ApiError;
		throw apiError;
	}
};

export const getNewById = async (id: number | string) => {
	try {
		const response = await apiClient.get(`/news/${id}/`);
		return response.data;
	} catch (error) {
		const apiError = error as ApiError;
		throw apiError;
	}
};

export const postNew = async (data: unknown) => {
	try {
		const response = await apiClient.post('/news', data, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	} catch (error) {
		const apiError = error as ApiError;
		throw apiError;
	}
};

export const putNew = async (id: number | string, data: unknown) => {
	try {
		const response = await apiClient.put(`/news/${id}`, data, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return response.data;
	} catch (error) {
		const apiError = error as ApiError;
		throw apiError;
	}
};

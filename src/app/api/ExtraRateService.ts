import { ApiError } from '../../_metronic/helpers';
import apiClient from '../hooks/apiClient';

export const getRates = async (queryParams: string) => {
	try {
		const response = await apiClient.get(`/rates${queryParams}`);
		return response.data;
	} catch (error) {
		const apiError = error as ApiError;
		throw apiError;
	}
};

export const getRateById = async (id: number | string) => {
	try {
		const response = await apiClient.get(`/rates/${id}/`);
		return response.data;
	} catch (error) {
		const apiError = error as ApiError;
		throw apiError;
	}
};

export const postRate = async (data: unknown) => {
	try {
		const response = await apiClient.post('/rates', data, {
			headers: {
				'Content-Type': 'application/json',
			},
		});
		return response.data;
	} catch (error) {
		const apiError = error as ApiError;
		throw apiError;
	}
};

export const putRate = async (id: number | string, data: unknown) => {
	try {
		const response = await apiClient.put(`/rates/${id}`, data, {
			headers: {
				'Content-Type': 'application/json',
			},
		});
		return response.data;
	} catch (error) {
		const apiError = error as ApiError;
		throw apiError;
	}
};

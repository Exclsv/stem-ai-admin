import { ApiError } from '../../_metronic/helpers';
import apiClient from '../hooks/apiClient';

export const getFaqs = async (queryParams: string) => {
	try {
		const response = await apiClient.get(`/faq${queryParams}`);
		return response.data;
	} catch (error) {
		const apiError = error as ApiError;
		throw apiError;
	}
};

export const getFaqById = async (id: number | string) => {
	try {
		const response = await apiClient.get(`/faq/${id}/`);
		return response.data;
	} catch (error) {
		const apiError = error as ApiError;
		throw apiError;
	}
};

export const postFaq = async (data: unknown) => {
	try {
		const response = await apiClient.post('/faq', data, {
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

export const putFaq = async (id: number | string, data: unknown) => {
	try {
		const response = await apiClient.put(`/faq/${id}`, data, {
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

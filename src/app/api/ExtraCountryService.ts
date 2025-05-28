import { ApiError } from '../../_metronic/helpers';
import apiClient from '../hooks/apiClient';

export const getCountries = async (queryParams: string) => {
	try {
		const response = await apiClient.get(`/countries${queryParams}`);
		return response.data;
	} catch (error) {
		const apiError = error as ApiError;
		throw apiError;
	}
};

export const getCountryById = async (id: number | string) => {
	try {
		const response = await apiClient.get(`/countries/${id}/`);
		return response.data;
	} catch (error) {
		const apiError = error as ApiError;
		throw apiError;
	}
};

export const postCountry = async (data: unknown) => {
	try {
		const response = await apiClient.post('/countries', data, {
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

export const putCountry = async (id: number | string, data: unknown) => {
	try {
		const response = await apiClient.put(`/countries/${id}`, data, {
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

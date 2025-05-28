import apiClient from '../hooks/apiClient';
import { LanguageType } from '../../_metronic/helpers';

export const getLanguages = async (params: string): Promise<LanguageType[]> => {
	const { data } = await apiClient.get(`/languages${params}`);
	return data;
};

export const createLanguage = async (
	language: Partial<LanguageType>
): Promise<LanguageType> => {
	const { data } = await apiClient.post('/languages/', language);
	return data;
};

export const updateLanguage = (id: number, data: Partial<LanguageType>) => {
	return apiClient.put(`/languages/${id}/`, data).then((res) => res.data);
};

export const deleteLanguage = async (id: number): Promise<void> => {
	await apiClient.delete(`/languages/${id}/`);
};

import apiClient from '../hooks/apiClient';
import { CategoryType } from '../../_metronic/helpers';

export interface MutationCategoryType {
	parent_category: number | null;
	image?: string;
	translations: { language_id: number; language_code: string; value: string }[];
	prompts: { language_id: number; language_code: string; prompt: string }[];
}

export const getCategories = async (
	params: string
): Promise<CategoryType[]> => {
	const { data } = await apiClient.get(`/projects${params}`);
	return data;
};

export const createCategory = async (category: MutationCategoryType) => {
	const { data } = await apiClient.post('/projects/', category);
	return data;
};

export const updateCategory = async (
	id: number,
	data: Partial<MutationCategoryType>
) => {
	const { data: updatedData } = await apiClient.put(`/projects/${id}/`, data);
	return updatedData;
};

export const deleteCategory = async (id: number): Promise<void> => {
	await apiClient.delete(`/projects/${id}`);
};

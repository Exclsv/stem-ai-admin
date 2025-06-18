import apiClient from '../hooks/apiClient';
import { QuestionType } from '../pages/question/types/questionTypes';

export interface PromptType {
	language_id: number;
	language_code: string;
	prompt: string;
}

export interface TranslationType {
	language_id: number;
	language_code: string;
	value: string;
}

export interface OptionType {
	translations: TranslationType[];
}

export interface QuestionMutationType {
	group: number;
	type: 'boolean' | 'select' | 'free_answer';
	prompts: PromptType[];
	translations: TranslationType[];
	options?: OptionType[];
}

// Получение вопросов группы
export const getQuestionsByGroupId = async (groupId: number): Promise<any> => {
	const { data } = await apiClient.get(`/question-group/${groupId}/`);
	return data;
};

// Создание вопроса
export const createQuestion = async (
	question: QuestionMutationType
): Promise<any> => {
	const { data } = await apiClient.post('/question/', question);
	return data;
};

// Обновление вопроса
export const updateQuestion = async (
	questionId: number,
	question: Partial<QuestionMutationType>
): Promise<any> => {
	const { data } = await apiClient.put(`/question/${questionId}/`, question);
	return data;
};

// Получение вопроса по ID
export const getQuestionById = async (questionId: number): Promise<any> => {
	const { data } = await apiClient.get(`/question/${questionId}/`);
	return data;
};

// Удаление вопроса
export const deleteQuestion = async (questionId: number): Promise<void> => {
	await apiClient.delete(`/question/${questionId}/`);
};

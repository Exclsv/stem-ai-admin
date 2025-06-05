import apiClient from '../hooks/apiClient';
import { StepType, StepTypeResponse } from '../pages/step/types/stepTypes';

// Получение всех шагов для проекта (временный API)
export const getStepsByProjectId = async (projectId: number): Promise<any> => {
	const { data } = await apiClient.get(
		`/projects/${projectId}/question-groups/`
	);
	return data.question_groups || [];
};

// Получение всех шагов для проекта (будущий API)
export const getStepsByProject = async (
	projectId: number
): Promise<StepTypeResponse> => {
	const { data } = await apiClient.get(`/question-group/project/${projectId}/`);
	return data;
};

// Получение конкретного шага
export const getStepById = async (stepId: number): Promise<any> => {
	const { data } = await apiClient.get(`/question-group/${stepId}/`);
	return data;
};

// Создание шага
export const createStep = async (step: StepType): Promise<any> => {
	const { data } = await apiClient.post('/question-group/', step);
	return data;
};

// Обновление шага
export const updateStep = async (
	stepId: number,
	step: Partial<StepType>
): Promise<any> => {
	const { data } = await apiClient.put(`/question-group/${stepId}/`, step);
	return data;
};

// Удаление шага
export const deleteStep = async (stepId: number): Promise<void> => {
	await apiClient.delete(`/question-group/${stepId}/`);
};

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getStepsByProjectId, getStepsByProject } from '../../api/step';
import { StepTypeResponse } from '../../pages/step/types/stepTypes';

// Хук для получения шагов по ID проекта (временный API)
export const useStepsByProjectId = (
	projectId: number,
	options?: UseQueryOptions<any, Error>
) => {
	return useQuery<any, Error>({
		queryKey: ['steps', projectId],
		queryFn: () => getStepsByProjectId(projectId),
		staleTime: 0,
		refetchOnMount: true,
		refetchOnWindowFocus: true,
		...options,
	});
};

// Хук для получения шагов по ID проекта (будущий API)
export const useStepsByProject = (
	projectId: number,
	options?: UseQueryOptions<StepTypeResponse, Error>
) => {
	return useQuery<StepTypeResponse, Error>({
		queryKey: ['steps', projectId],
		queryFn: () => getStepsByProject(projectId),
		staleTime: 0,
		refetchOnMount: true,
		refetchOnWindowFocus: true,
		...options,
		enabled: false, // Этот хук не будет выполняться автоматически, пока API не будет готов
	});
};

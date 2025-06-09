import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getQuestionsByGroupId } from '../../api/question';

// Хук для получения вопросов по ID группы
export const useQuestionsByGroupId = (
	groupId: number,
	options?: UseQueryOptions<any, Error>
) => {
	return useQuery<any, Error>({
		queryKey: ['questions', groupId],
		queryFn: () => getQuestionsByGroupId(groupId),
		staleTime: 0,
		refetchOnMount: true,
		refetchOnWindowFocus: true,
		...options,
	});
};

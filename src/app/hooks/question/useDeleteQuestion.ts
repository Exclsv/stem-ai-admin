import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { deleteQuestion } from '../../api/question';

export const useDeleteQuestion = (
	options?: UseMutationOptions<void, Error, number>
) => {
	return useMutation<void, Error, number>({
		mutationFn: (id: number) => deleteQuestion(id),
		...options,
	});
};

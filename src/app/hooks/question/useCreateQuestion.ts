import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { createQuestion, QuestionMutationType } from '../../api/question';

export const useCreateQuestion = (
	options?: UseMutationOptions<any, Error, QuestionMutationType>
) => {
	return useMutation<any, Error, QuestionMutationType>({
		mutationFn: (data: QuestionMutationType) => createQuestion(data),
		...options,
	});
};

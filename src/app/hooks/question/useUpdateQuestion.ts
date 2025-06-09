import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { updateQuestion, QuestionMutationType } from '../../api/question';

interface UpdateQuestionParams {
	id: number;
	data: Partial<QuestionMutationType>;
}

export const useUpdateQuestion = (
	options?: UseMutationOptions<any, Error, UpdateQuestionParams>
) => {
	return useMutation<any, Error, UpdateQuestionParams>({
		mutationFn: ({ id, data }: UpdateQuestionParams) =>
			updateQuestion(id, data),
		...options,
	});
};

import {
	useMutation,
	useQueryClient,
	UseMutationOptions,
} from '@tanstack/react-query';
import { updateCategory, MutationCategoryType } from '../../api/category';

type UpdatePayload = {
	id: number;
	data: Partial<MutationCategoryType>;
};

export const useUpdateCategory = (
	options?: UseMutationOptions<MutationCategoryType, Error, UpdatePayload>
) => {
	const queryClient = useQueryClient();

	return useMutation<MutationCategoryType, Error, UpdatePayload>({
		mutationFn: async ({ id, data }) => updateCategory(id, data),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: ['categories'] });
			options?.onSuccess?.(data, variables, context);
		},
		...options,
	});
};

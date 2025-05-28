import {
	useMutation,
	useQueryClient,
	UseMutationOptions,
} from '@tanstack/react-query';
import { createCategory, MutationCategoryType } from '../../api/category';

export const useCreateCategory = (
	options?: UseMutationOptions<
		MutationCategoryType,
		Error,
		Partial<MutationCategoryType>
	>
) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createCategory,
		onSuccess: (...args) => {
			options?.onSuccess?.(...args);
			queryClient.invalidateQueries({ queryKey: ['categories'] });
		},
		...options,
	});
};

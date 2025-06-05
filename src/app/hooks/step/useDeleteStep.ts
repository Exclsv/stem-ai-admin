import {
	useMutation,
	useQueryClient,
	UseMutationOptions,
} from '@tanstack/react-query';
import { deleteStep } from '../../api/step';

export const useDeleteStep = (
	options?: UseMutationOptions<void, Error, number>
) => {
	const queryClient = useQueryClient();

	return useMutation<void, Error, number>({
		mutationFn: deleteStep,
		onSuccess: (_, variables, context) => {
			queryClient.invalidateQueries({ queryKey: ['steps'] });
			options?.onSuccess?.(_, variables, context);
		},
		...options,
	});
};

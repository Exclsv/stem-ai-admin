import {
	useMutation,
	useQueryClient,
	UseMutationOptions,
} from '@tanstack/react-query';
import { createStep } from '../../api/step';
import { StepType } from '../../pages/step/types/stepTypes';

export const useCreateStep = (
	options?: UseMutationOptions<any, Error, StepType>
) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createStep,
		onSuccess: (...args) => {
			options?.onSuccess?.(...args);
			queryClient.invalidateQueries({ queryKey: ['steps'] });
		},
		...options,
	});
};

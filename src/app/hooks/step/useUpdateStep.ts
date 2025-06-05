import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import { updateStep } from '../../api/step';
import { StepType } from '../../pages/step/types/stepTypes';

type UpdatePayload = {
  id: number;
  data: Partial<StepType>;
};

export const useUpdateStep = (
  options?: UseMutationOptions<any, Error, UpdatePayload>
) => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, UpdatePayload>({
    mutationFn: async ({ id, data }) => updateStep(id, data),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ['steps'] });
      options?.onSuccess?.(data, variables, context);
    },
    ...options,
  });
}; 
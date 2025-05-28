import {
	useMutation,
	useQueryClient,
	UseMutationOptions,
} from '@tanstack/react-query';
import { LanguageType } from '../../../_metronic/helpers';
import { updateLanguage } from '../../api/language';

type UpdatePayload = {
	id: number;
	data: Partial<LanguageType>;
};

export const useUpdateLanguage = (
	options?: UseMutationOptions<LanguageType, Error, UpdatePayload>
) => {
	const queryClient = useQueryClient();

	return useMutation<LanguageType, Error, UpdatePayload>({
		mutationFn: async ({ id, data }) => updateLanguage(id, data),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: ['languages'] });
			options?.onSuccess?.(data, variables, context);
		},
		...options,
	});
};

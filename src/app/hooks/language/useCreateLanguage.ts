import {
	useMutation,
	useQueryClient,
	UseMutationOptions,
} from '@tanstack/react-query';
import { createLanguage } from '../../api/language';
import { LanguageType } from '../../../_metronic/helpers';

export const useCreateLanguage = (
	options?: UseMutationOptions<LanguageType, Error, Partial<LanguageType>>
) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createLanguage,
		onSuccess: (...args) => {
			options?.onSuccess?.(...args);
			queryClient.invalidateQueries({ queryKey: ['languages'] });
		},
		...options,
	});
};

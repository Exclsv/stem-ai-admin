import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getLanguages } from '../../api/language';
import { LanguageType, ApiResponse } from '../../../_metronic/helpers';

export const useLanguages = (
	params: string,
	options?: UseQueryOptions<ApiResponse<LanguageType>, Error>
) => {
	return useQuery<ApiResponse<LanguageType>, Error>({
		queryKey: ['languages', params],
		queryFn: () => getLanguages(params),
		staleTime: 1000 * 60 * 10,
		...options,
	});
};

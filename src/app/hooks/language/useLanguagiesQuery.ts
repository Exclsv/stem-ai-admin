import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getLanguages } from '../../api/language';
import { LanguageType } from '../../../_metronic/helpers';

export const useLanguages = (
	params: string,
	options?: UseQueryOptions<LanguageType[], Error>
) => {
	return useQuery<LanguageType[], Error>({
		queryKey: ['languages', params],
		queryFn: () => getLanguages(params),
		staleTime: 1000 * 60 * 10,
		...options,
	});
};

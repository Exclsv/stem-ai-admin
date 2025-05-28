import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getCategories } from '../../api/category';
import { CategoryType } from '../../../_metronic/helpers';

export const useCategories = (
	params: string,
	options?: UseQueryOptions<CategoryType[], Error>
) => {
	return useQuery<CategoryType[], Error>({
		queryKey: ['categories', params],
		queryFn: () => getCategories(params),
		staleTime: 1000 * 60 * 10,
		...options,
	});
};

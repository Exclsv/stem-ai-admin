import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getCategories } from '../../api/category';
import { CategoryType } from '../../../_metronic/helpers';

export const useCategoriesForSelect = (
	options?: UseQueryOptions<CategoryType[], Error>
) => {
	return useQuery<CategoryType[], Error>({
		queryKey: ['categories-for-select'],
		queryFn: () => getCategories('?page=1&page_size=100'),
		staleTime: 0,
		refetchOnMount: true,
		refetchOnWindowFocus: true,
		...options,
	});
}; 
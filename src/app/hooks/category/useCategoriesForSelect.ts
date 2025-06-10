import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getCategories } from '../../api/category';
import { CategoryType, ApiResponse } from '../../../_metronic/helpers';

export const useCategoriesForSelect = (
	options?: UseQueryOptions<ApiResponse<CategoryType>, Error>
) => {
	return useQuery<ApiResponse<CategoryType>, Error>({
		queryKey: ['categories-for-select'],
		queryFn: () => getCategories('?page=1&page_size=100'),
		staleTime: 0,
		refetchOnMount: true,
		refetchOnWindowFocus: true,
		...options,
	});
};

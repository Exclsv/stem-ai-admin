import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getCategories } from '../../api/category';
import { CategoryType, ApiResponse } from '../../../_metronic/helpers';

export const useCategories = (
	params: string,
	options?: UseQueryOptions<ApiResponse<CategoryType>, Error>
) => {
	return useQuery<ApiResponse<CategoryType>, Error>({
		queryKey: ['categories', params],
		queryFn: () => getCategories(params),
		staleTime: 1000 * 60 * 10,
		...options,
	});
};

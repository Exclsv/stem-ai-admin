/**
 * Интерфейс пагинации для ответов API
 */
export interface Pagination {
	total: number;
	per_page: number;
	current_page: number;
	last_page: number;
	next_page_url: string | null;
	prev_page_url: string | null;
}

/**
 * Обобщенный тип ответа API с пагинацией
 */
export interface ApiResponse<T> {
	data: T[];
	pagination: Pagination;
}

export interface ApiError {
	response: {
		status: number;
		data?: {
			message?: string;
		} & unknown;
		message?: string;
	};
}

export type TableHeadType = {
	key: string;
	title: string;
	isActive?: boolean;
	disabled: boolean;
	className?: string;
};

export type GenericObject = { [key: string]: unknown };

export function buildQueryParams<T extends object>(
	base: T,
	extra?: Partial<T>
): T {
	return {
		...base,
		...(extra ?? {}),
	};
}

export type OptionType = {
	value: string | number | null;
	label: string;
};

interface QuestionTranslationType {
	language_id: number;
	language_code: string;
	value: string;
}

interface QuestionOptionTranslationType {
	id: number;
	language_id: number;
	value: string;
}

interface QuestionOptionType {
	id: number;
	translations: QuestionOptionTranslationType[];
}

export interface QuestionType {
	id: number;
	group: number;
	type: 'boolean' | 'select' | 'free_answer';
	translations: QuestionTranslationType[];
	options: QuestionOptionType[];
}

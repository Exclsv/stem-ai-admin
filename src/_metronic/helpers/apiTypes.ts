export interface FeatureRes {
	id: number;
	created_at: string;
	created_by: number;
	updated_at: string;
	updated_by: number;
	comment_user?: string;
	comment_admin?: string;
	is_active?: boolean;
	is_delete?: boolean;
}

export interface PromptType extends FeatureRes {
	language_id: number;
	prompt: string;
	language_code: string;
}

export interface LanguageType extends FeatureRes {
	name: string;
	code: string;
}

export interface SubCategoryType extends FeatureRes {
	image: string;
	translations: LanguageType[];
	prompts: PromptType[];
}

export interface CategoryType extends FeatureRes {
	parent_category: SubCategoryType;
	image: string;
	translations: LanguageType[];
	prompts: PromptType[];
}

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useIntl } from 'react-intl';
import { FC, useState, useEffect, ChangeEvent, useRef } from 'react';
import { toast } from 'react-toastify';
import {
	SDConfirmationModal,
	SDInput,
	SDInputSelect,
	SDOffcanvas,
	SDTextarea,
} from '../../../components';
import {
	ApiError,
	notifyError,
	CategoryType,
	LanguageType,
} from '../../../../_metronic/helpers';
import { useCreateCategory } from '../../../hooks/category/useCreateCategory.ts';
import { useUpdateCategory } from '../../../hooks/category/useUpdateCategory.ts';
import { useCategoriesForSelect } from '../../../hooks/category/useCategoriesForSelect.ts';
import { useQueryClient } from '@tanstack/react-query';
import { Option } from '../../../components/input-select';

// Максимальный размер файла - 5 МБ
const MAX_FILE_SIZE = 5 * 1024 * 1024;

type AddOrEditOffcanvasProps = {
	show: boolean;
	onHide: () => void;
	choosenItem?: CategoryType | null;
	setShowDeleteModal?: () => void;
	refetch: () => void;
	type: 'edit' | 'add';
	languages?: LanguageType[];
};

type TranslationType = {
	language_id: number;
	language_code: string;
	value: string;
	isRequired?: boolean;
};

type PromptType = {
	language_id: number;
	language_code: string;
	prompt: string;
	isRequired?: boolean;
};

type FormValuesType = {
	parent_category: number | null;
	image?: string;
	translations: TranslationType[];
	prompts: PromptType[];
};

// Функция глубокого сравнения объектов для проверки изменений
const checkFormHasChanged = (
	initialValues: any,
	currentValues: any,
	hasFile: boolean
): boolean => {
	// Если файл был выбран, форма считается измененной
	if (hasFile) return true;

	// Проверяем изменения в parent_category
	if (initialValues.parent_category !== currentValues.parent_category)
		return true;

	// Проверяем изменения в translations
	const translationsChanged = initialValues.translations.some(
		(t: any, index: number) => {
			return t.value !== currentValues.translations[index]?.value;
		}
	);

	// Проверяем изменения в prompts
	const promptsChanged = initialValues.prompts.some((p: any, index: number) => {
		return p.prompt !== currentValues.prompts[index]?.prompt;
	});

	return translationsChanged || promptsChanged;
};

export const AddOrEditOffcanvas: FC<AddOrEditOffcanvasProps> = ({
	show,
	onHide,
	choosenItem,
	setShowDeleteModal,
	refetch,
	type,
	languages,
}) => {
	const intl = useIntl();
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [formIsDirty, setFormIsDirty] = useState(false);
	// Сохраняем начальные значения для сравнения
	const initialFormValuesRef = useRef<FormValuesType | null>(null);

	const { mutateAsync: createCategory } = useCreateCategory();
	const { mutateAsync: updateCategory } = useUpdateCategory();
	const { data: categoriesForSelect, isLoading: isCategoriesLoading } =
		useCategoriesForSelect();
	const queryClient = useQueryClient();

	// Инициализация схемы валидации с проверкой всех полей
	const validationSchema = Yup.object().shape({
		parent_category: Yup.number()
			.nullable()
			.test({
				name: 'one-level-depth',
				message: intl.formatMessage({
					id: 'VALIDATION.CATEGORY.ONE_LEVEL_DEPTH',
				}),
				test: function (value) {
					// Если мы не задаём родителя, то всё ок
					if (value === null) return true;

					// Если мы редактируем категорию, проверяем, что она не имеет подкатегорий
					if (choosenItem && categoriesForSelect) {
						const hasSubcategories = categoriesForSelect.some(
							(cat) => cat.parent_category === choosenItem.id
						);

						// Если уже есть подкатегории и пытаемся задать parent_category,
						// то возвращаем ошибку
						if (hasSubcategories) {
							return false;
						}
					}

					return true;
				},
			}),
		image: Yup.mixed().test({
			name: 'fileSize',
			message: intl.formatMessage(
				{ id: 'VALIDATION.MAX_FILE_SIZE' },
				{ size: '5MB' }
			),
			test: function (value) {
				if (!value || typeof value === 'string') return true;
				if (selectedFile) return selectedFile.size <= MAX_FILE_SIZE;
				return true;
			},
		}),
		translations: Yup.array().of(
			Yup.object().shape({
				value: Yup.string().test({
					name: 'is-required',
					message: intl.formatMessage(
						{ id: 'VALIDATION.REQUIRED' },
						{ field: 'Name' }
					),
					test: function (value) {
						const { parent } = this;
						return (
							!parent.isRequired || (value !== undefined && value.trim() !== '')
						);
					},
				}),
			})
		),
		prompts: Yup.array().of(
			Yup.object().shape({
				prompt: Yup.string().test({
					name: 'is-required',
					message: intl.formatMessage(
						{ id: 'VALIDATION.REQUIRED' },
						{ field: 'Prompt' }
					),
					test: function (value) {
						const { parent } = this;
						return (
							!parent.isRequired || (value !== undefined && value.trim() !== '')
						);
					},
				}),
			})
		),
	});

	// Инициализация начальных значений формы
	const getInitialValues = (): FormValuesType => {
		let initialTranslations: TranslationType[] = [];
		let initialPrompts: PromptType[] = [];

		if (languages) {
			initialTranslations = languages.map((lang) => {
				const existingTranslation = choosenItem?.translations.find(
					(t) => t.language_id === lang.id
				);
				return {
					language_id: lang.id,
					language_code: lang.code,
					value: existingTranslation?.value || '',
					isRequired: true, // Все языки обязательны
				};
			});

			initialPrompts = languages.map((lang) => {
				const existingPrompt = choosenItem?.prompts.find(
					(p) => p.language_id === lang.id
				);
				return {
					language_id: lang.id,
					language_code: lang.code,
					prompt: existingPrompt?.prompt || '',
					isRequired: true, // Промпты обязательны
				};
			});
		}

		return {
			parent_category: choosenItem?.parent_category || null,
			image: choosenItem?.image || undefined,
			translations: initialTranslations,
			prompts: initialPrompts,
		};
	};

	const formik = useFormik({
		initialValues: getInitialValues(),
		validationSchema,
		enableReinitialize: false,
		validateOnChange: true,
		validateOnBlur: true,
		onSubmit: async (values, { setSubmitting, resetForm }) => {
			try {
				const isEdit = type === 'edit' && choosenItem?.id;

				// Подготовка данных для отправки на сервер
				let imageValue: string | undefined = values.image;

				// Обработка файла изображения
				if (selectedFile) {
					// Здесь должна быть логика загрузки файла на сервер
					// и получение URL или base64 строки
					// Для примера оставляем значение undefined
					imageValue = undefined;
				}

				// Проверяем, что translations содержат валидные значения
				const validTranslations = values.translations.filter(
					(t) => t.value.trim() !== ''
				);
				const validPrompts = values.prompts.filter(
					(p) => p.prompt.trim() !== ''
				);

				if (validTranslations.length === 0) {
					toast.error(
						intl.formatMessage(
							{ id: 'VALIDATION.REQUIRED' },
							{ field: intl.formatMessage({ id: 'COMMON.TRANSLATIONS' }) }
						)
					);
					setSubmitting(false);
					return;
				}

				// Проверяем наличие промптов
				if (validPrompts.length === 0) {
					toast.error(
						intl.formatMessage(
							{ id: 'VALIDATION.REQUIRED' },
							{ field: intl.formatMessage({ id: 'COMMON.PROMPTS' }) }
						)
					);
					setSubmitting(false);
					return;
				}

				// Формируем данные для запроса
				const requestData = {
					// Явно указываем parent_category, даже если оно null
					parent_category: values.parent_category,
					translations: validTranslations.map(
						({ language_id, language_code, value }) => ({
							language_id,
							language_code,
							value,
						})
					),
					prompts: validPrompts.map(
						({ language_id, language_code, prompt }) => ({
							language_id,
							language_code,
							prompt,
						})
					),
				};

				// Добавляем изображение только если оно задано
				if (imageValue !== undefined) {
					(requestData as any).image = imageValue;
				}

				if (isEdit) {
					await updateCategory({ id: choosenItem.id, data: requestData });
				} else {
					await createCategory(requestData);
				}

				// Сбрасываем состояние
				resetForm();
				setSelectedFile(null);
				setFormIsDirty(false);

				// Обновляем данные на странице категорий
				refetch();

				// Обновляем список категорий в React Query
				await queryClient.invalidateQueries({
					queryKey: ['categories-for-select'],
				});

				toast.success(
					intl.formatMessage({
						id:
							type === 'edit'
								? 'NOTIFICATION.CATEGORY.UPDATED'
								: 'NOTIFICATION.CATEGORY.CREATED',
					})
				);

				onHide();
			} catch (error) {
				console.error('Error updating/creating category:', error);
				const apiError = error as ApiError;
				notifyError(intl, apiError.response?.status || 500);
			} finally {
				setSubmitting(false);
			}
		},
	});

	// Для отладки
	useEffect(() => {
		console.log('Category form checking for changes...');
	}, [formik.values]);

	// Устанавливаем начальные значения при открытии или изменении исходных данных
	useEffect(() => {
		if (show) {
			const newInitialValues = getInitialValues();

			// Устанавливаем значения формы
			formik.setValues(newInitialValues, false);

			// Сохраняем начальные значения для дальнейшего сравнения
			initialFormValuesRef.current = JSON.parse(
				JSON.stringify(newInitialValues)
			);

			// Сбрасываем состояние формы
			setSelectedFile(null);
			setFormIsDirty(false);

			console.log('Initialized form with values:', newInitialValues);
		}
	}, [choosenItem, languages, show]);

	// Проверяем изменения формы при каждом изменении значений
	useEffect(() => {
		if (initialFormValuesRef.current) {
			const hasChanges = checkFormHasChanged(
				initialFormValuesRef.current,
				formik.values,
				selectedFile !== null
			);

			console.log(
				'Form has changes:',
				hasChanges,
				'Selected file:',
				selectedFile !== null
			);
			setFormIsDirty(hasChanges);
		}
	}, [formik.values, selectedFile]);

	const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		setSelectedFile(file);
	};

	// Подготовка опций для выпадающего списка категорий
	const getCategoryOptions = () => {
		if (!categoriesForSelect) return [];

		// Фильтруем категории, чтобы избежать циклической зависимости
		// и ограничить глубину вложенности одним уровнем
		return categoriesForSelect
			.filter((category) => {
				// Если мы находимся в режиме редактирования, исключаем текущую категорию
				if (choosenItem && category.id === choosenItem.id) return false;

				// ВАЛИДАЦИЯ ГЛУБИНЫ ВЛОЖЕННОСТИ

				// 1. Категории, уже являющиеся подкатегориями, не могут быть родительскими
				if (category.parent_category !== null) return false;

				// 2. Если мы редактируем категорию, которая уже является родительской,
				// она не может стать подкатегорией
				if (choosenItem) {
					const hasSubcategories = categoriesForSelect.some(
						(cat) => cat.parent_category === choosenItem.id
					);

					// Если уже есть подкатегории и пытаемся задать parent_category,
					// то запрещаем выбирать любую категорию в качестве родителя
					if (hasSubcategories) {
						return false;
					}
				}

				return true;
			})
			.map((category) => {
				// Находим перевод категории (предпочитаем русский или первый доступный)
				let label = `Category ID: ${category.id}`;

				// Проверяем наличие переводов
				if (category.translations && category.translations.length > 0) {
					// Пробуем найти русский перевод
					const ruTranslation = category.translations.find(
						(t) => t.language_code === 'ru'
					);

					if (ruTranslation) {
						// Используем value, т.к. это единственное доступное свойство в этом объекте
						label = ruTranslation.value || label;
					} else {
						// Используем первый доступный перевод
						const firstTranslation = category.translations[0];
						label = firstTranslation.value || label;
					}
				}

				return {
					value: category.id,
					label: label,
				};
			});
	};

	// Функция обработки изменения родительской категории
	const handleParentCategoryChange = (option: Option | null) => {
		formik.setFieldValue('parent_category', option?.value || null);
	};

	const handleOnHide = () => {
		if (formIsDirty) {
			setShowConfirmationModal(true);
		} else {
			handleConfirmClose();
		}
	};

	const handleConfirmClose = () => {
		setShowConfirmationModal(false);
		formik.resetForm();
		setSelectedFile(null);
		setFormIsDirty(false);
		onHide();
	};

	const isDisabled = formik.isSubmitting;

	return (
		<SDOffcanvas
			show={show}
			onHide={handleOnHide}
			title={intl.formatMessage({
				id: type === 'add' ? 'COMMON.ADD' : 'COMMON.EDIT',
			})}
			width={'w-50'}
			onClick={() => formik.handleSubmit()}
			dropdownItems={
				type === 'edit' &&
				setShowDeleteModal && (
					<li>
						<button className="btn dropdown-item" onClick={setShowDeleteModal}>
							{intl.formatMessage({ id: 'COMMON.DELETE' })}
						</button>
					</li>
				)
			}>
			<div className="row">
				<div className="col-6 mb-5">
					<SDInput
						type="file"
						maxLength={128}
						label={intl.formatMessage({ id: 'COMMON.IMAGE' })}
						onChange={handleFileChange}
						touched={formik.touched.image}
						errors={formik.errors.image}
						disabled={isDisabled}
						helpText={intl.formatMessage(
							{ id: 'VALIDATION.MAX_FILE_SIZE_HINT' },
							{ size: '5MB' }
						)}
					/>
				</div>
				<div className="col-6 mb-5">
					<SDInputSelect
						label={intl.formatMessage({ id: 'COMMON.PARENT_CATEGORY' })}
						options={getCategoryOptions()}
						value={formik.values.parent_category}
						onChange={handleParentCategoryChange}
						touched={formik.touched.parent_category}
						errors={formik.errors.parent_category}
						disabled={isDisabled || isCategoriesLoading}
						isClearable
						placeholder={
							isCategoriesLoading
								? intl.formatMessage({ id: 'COMMON.LOADING' })
								: intl.formatMessage({ id: 'COMMON.SELECT' })
						}
					/>
					{/* Подсказка для категорий с подкатегориями */}
					{choosenItem &&
						categoriesForSelect?.some(
							(cat) => cat.parent_category === choosenItem.id
						) && (
							<div className="text-muted fs-7 mt-2">
								{intl.formatMessage({
									id: 'VALIDATION.CATEGORY.HAS_SUBCATEGORIES_HINT',
								})}
							</div>
						)}
				</div>
			</div>

			{languages?.map((lang, index) => (
				<div key={`translation-${lang.id}`} className="col-6 mb-3">
					<SDInput
						maxLength={128}
						label={`${intl.formatMessage({ id: 'COMMON.NAME' })} (${lang.name})`}
						name={`translations[${index}].value`}
						value={formik.values.translations[index]?.value || ''}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						touched={Boolean(
							formik.touched.translations && formik.touched.translations[index]
						)}
						errors={
							formik.errors.translations &&
							formik.errors.translations[index] &&
							typeof formik.errors.translations[index] === 'object'
								? (formik.errors.translations[index] as any)?.value
								: undefined
						}
						required
						disabled={isDisabled}
					/>
				</div>
			))}

			{languages?.map((lang, index) => (
				<div key={`prompt-${lang.id}`} className="col-6 mb-3">
					<SDTextarea
						maxLength={128}
						label={`${intl.formatMessage({ id: 'COMMON.PROMPT' })} (${lang.name})`}
						name={`prompts[${index}].prompt`}
						value={formik.values.prompts[index]?.prompt || ''}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						touched={Boolean(
							formik.touched.prompts && formik.touched.prompts[index]
						)}
						errors={
							formik.errors.prompts &&
							formik.errors.prompts[index] &&
							typeof formik.errors.prompts[index] === 'object'
								? (formik.errors.prompts[index] as any)?.prompt
								: undefined
						}
						disabled={isDisabled}
						required
					/>
				</div>
			))}
			<SDConfirmationModal
				show={showConfirmationModal}
				onConfirmHide={handleConfirmClose}
				onHide={() => setShowConfirmationModal(false)}
			/>
		</SDOffcanvas>
	);
};

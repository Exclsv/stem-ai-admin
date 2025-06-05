import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useIntl } from 'react-intl';
import { FC, useState, useEffect, ChangeEvent } from 'react';
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

type translationType = {
	language_id: number;
	language_code: string;
	value: string;
};

type promptType = {
	language_id: number;
	language_code: string;
	prompt: string;
};

type initialValuesType = {
	parent_category: number | null;
	image?: string;
	translations: translationType[];
	prompts: promptType[];
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
	const [translations, setTranslations] = useState<translationType[]>([]);
	const [prompts, setPrompts] = useState<promptType[]>([]);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const { mutateAsync: createCategory } = useCreateCategory();
	const { mutateAsync: updateCategory } = useUpdateCategory();
	const { data: categoriesForSelect, isLoading: isCategoriesLoading } =
		useCategoriesForSelect();
	const queryClient = useQueryClient();

	// Инициализация переводов и промптов при загрузке данных
	useEffect(() => {
		if (choosenItem && languages) {
			// Инициализация переводов
			const initialTranslations = languages.map((lang) => {
				const existingTranslation = choosenItem.translations.find(
					(t) => t.language_id === lang.id
				);
				return {
					language_id: lang.id,
					language_code: lang.code,
					value: existingTranslation?.value || '',
				};
			});
			setTranslations(initialTranslations);

			// Инициализация промптов
			const initialPrompts = languages.map((lang) => {
				const existingPrompt = choosenItem.prompts.find(
					(p) => p.language_id === lang.id
				);
				return {
					language_id: lang.id,
					language_code: lang.code,
					prompt: existingPrompt?.prompt || '',
				};
			});
			setPrompts(initialPrompts);
		} else if (languages) {
			// Для новой категории создаем пустые переводы и промпты
			const emptyTranslations = languages.map((lang) => ({
				language_id: lang.id,
				language_code: lang.code,
				value: '',
			}));
			setTranslations(emptyTranslations);

			const emptyPrompts = languages.map((lang) => ({
				language_id: lang.id,
				language_code: lang.code,
				prompt: '',
			}));
			setPrompts(emptyPrompts);
		}
	}, [choosenItem, languages]);

	const validationSchema = Yup.object().shape({
		parent_category: Yup.number()
			.nullable()
			.test(
				'one-level-depth',
				intl.formatMessage({ id: 'VALIDATION.CATEGORY.ONE_LEVEL_DEPTH' }),
				function (value) {
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
							return this.createError({
								message: intl.formatMessage({
									id: 'VALIDATION.CATEGORY.CANNOT_HAVE_PARENT_WITH_SUBCATEGORIES',
								}),
							});
						}
					}

					return true;
				}
			),
		image: Yup.mixed().test(
			'fileSize',
			intl.formatMessage({ id: 'VALIDATION.MAX_FILE_SIZE' }, { size: '5MB' }),
			(value) => {
				if (!value || typeof value === 'string') return true;
				if (selectedFile) return selectedFile.size <= MAX_FILE_SIZE;
				return true;
			}
		),
	});

	const initialValues: initialValuesType = {
		parent_category: choosenItem?.parent_category || null,
		image: choosenItem?.image || undefined,
		translations: [],
		prompts: [],
	};

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

	const formik = useFormik({
		initialValues,
		enableReinitialize: true,
		validationSchema,
		onSubmit: async (values, { setSubmitting }) => {
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

			// Проверяем, что translations и prompts содержат валидные значения
			const validTranslations = translations.filter(
				(t) => t.value.trim() !== ''
			);
			const validPrompts = prompts.filter((p) => p.prompt.trim() !== '');

			if (validTranslations.length === 0) {
				toast.error(
					intl.formatMessage(
						{ id: 'VALIDATION.REQUIRED_FIELD' },
						{ field: intl.formatMessage({ id: 'COMMON.TRANSLATIONS' }) }
					)
				);
				setSubmitting(false);
				return;
			}

			// Формируем данные для запроса
			const requestData = {
				// Явно указываем parent_category, даже если оно null
				parent_category: values.parent_category,
				translations: validTranslations,
				prompts: validPrompts,
			};

			// Добавляем изображение только если оно задано
			if (imageValue !== undefined) {
				(requestData as any).image = imageValue;
			}

			console.log('Sending data to API:', requestData);

			try {
				if (isEdit) {
					// Для обновления явно проверяем, является ли это конвертацией из подкатегории в обычную категорию
					if (
						choosenItem?.parent_category !== null &&
						values.parent_category === null
					) {
						console.log('Converting subcategory to regular category');
					}
					await updateCategory({ id: choosenItem.id, data: requestData });
				} else {
					await createCategory(requestData);
				}
				handleConfirmClose();

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
			} catch (error) {
				console.error('Error updating/creating category:', error);
				const apiError = error as ApiError;
				notifyError(intl, apiError.response?.status || 500);
			} finally {
				setSubmitting(false);
			}
		},
	});

	const handleOnHide = () => {
		if (formik.dirty) {
			setShowConfirmationModal(true);
		} else {
			handleConfirmClose();
		}
	};

	const handleConfirmClose = () => {
		setShowConfirmationModal(false);
		formik.resetForm();
		setSelectedFile(null);
		onHide();
	};

	const isDisabled = formik.isSubmitting;

	// Функция обработки изменения родительской категории
	const handleParentCategoryChange = (option: Option | null) => {
		formik.setFieldValue('parent_category', option?.value || null);
	};

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
						touched={formik.touched.translations?.[index]?.value}
						errors={formik.errors.translations?.[index]}
						required
						disabled={isDisabled}
						value={translations[index]?.value || ''}
						onChange={(e) => {
							setTranslations((prev) => {
								const newTranslations = [...prev];
								newTranslations[index] = {
									...newTranslations[index],
									value: e.target.value,
									language_id: lang.id,
									language_code: lang.code,
								};
								return newTranslations;
							});
						}}
					/>
				</div>
			))}

			{languages?.map((lang, index) => (
				<div key={`prompt-${lang.id}`} className="col-6 mb-3">
					<SDTextarea
						maxLength={128}
						label={`${intl.formatMessage({ id: 'COMMON.PROMPT' })} (${lang.name})`}
						touched={formik.touched.prompts?.[index]?.prompt}
						errors={
							formik.errors.prompts?.[index] as
								| string
								| { value?: string }
								| undefined
						}
						required
						disabled={isDisabled}
						value={prompts[index]?.prompt || ''}
						onChange={(e) => {
							setPrompts((prev) => {
								const newPrompts = [...prev];
								newPrompts[index] = {
									...newPrompts[index],
									prompt: e.target.value,
									language_id: lang.id,
									language_code: lang.code,
								};
								return newPrompts;
							});
						}}
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

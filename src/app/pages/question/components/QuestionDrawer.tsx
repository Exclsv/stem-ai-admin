import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useIntl } from 'react-intl';
import { FC, useState, useEffect, useRef } from 'react';
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
	LanguageType,
} from '../../../../_metronic/helpers';
import { useCreateQuestion } from '../../../hooks/question/useCreateQuestion';
import { useUpdateQuestion } from '../../../hooks/question/useUpdateQuestion';
import { QuestionType } from '../types/questionTypes';
import { Option } from '../../../components/input-select';
import { KTIcon } from '../../../../_metronic/helpers';

type QuestionDrawerProps = {
	show: boolean;
	onHide: () => void;
	choosenItem?: QuestionType | null;
	setShowDeleteModal?: () => void;
	refetch: () => void;
	type: 'edit' | 'add';
	languages?: LanguageType[];
	groupId: number;
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

type OptionTranslationType = {
	language_id: number;
	language_code: string;
	value: string;
	isRequired?: boolean;
};

type OptionType = {
	id?: number;
	translations: OptionTranslationType[];
};

type QuestionTypeEnum = 'boolean' | 'select' | 'free_answer';

type FormValuesType = {
	group: number;
	type: QuestionTypeEnum;
	translations: TranslationType[];
	prompts: PromptType[];
	options: OptionType[];
};

// Функция для проверки изменений в форме
const checkFormHasChanged = (
	initialValues: any,
	currentValues: any
): boolean => {
	// Проверяем изменение типа вопроса
	if (initialValues.type !== currentValues.type) return true;

	// Проверяем изменения в переводах
	const translationsChanged = initialValues.translations.some(
		(t: any, index: number) => {
			return t.value !== currentValues.translations[index]?.value;
		}
	);

	// Проверяем изменения в промптах
	const promptsChanged = initialValues.prompts.some((p: any, index: number) => {
		return p.prompt !== currentValues.prompts[index]?.prompt;
	});

	// Проверяем изменения в вариантах ответов
	const optionsChanged =
		JSON.stringify(initialValues.options) !==
		JSON.stringify(currentValues.options);

	return translationsChanged || promptsChanged || optionsChanged;
};

export const QuestionDrawer: FC<QuestionDrawerProps> = ({
	show,
	onHide,
	choosenItem,
	setShowDeleteModal,
	refetch,
	type,
	languages,
	groupId,
}) => {
	const intl = useIntl();
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);
	const [formIsDirty, setFormIsDirty] = useState(false);

	// Сохраняем начальные значения для сравнения
	const initialFormValuesRef = useRef<FormValuesType | null>(null);

	const { mutateAsync: createQuestion } = useCreateQuestion();
	const { mutateAsync: updateQuestion } = useUpdateQuestion();

	// Инициализация схемы валидации с проверкой всех полей
	const validationSchema = Yup.object().shape({
		group: Yup.number().required(
			intl.formatMessage({ id: 'VALIDATION.REQUIRED' }, { field: 'Group' })
		),
		type: Yup.string()
			.oneOf(['boolean', 'select', 'free_answer'])
			.required(
				intl.formatMessage({ id: 'VALIDATION.REQUIRED' }, { field: 'Type' })
			),
		translations: Yup.array().of(
			Yup.object().shape({
				value: Yup.string().test({
					name: 'is-required',
					message: intl.formatMessage(
						{ id: 'VALIDATION.REQUIRED' },
						{ field: 'Question' }
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
		options: Yup.array().when('type', {
			is: (val: string) => val === 'boolean' || val === 'select',
			then: (schema) =>
				schema.of(
					Yup.object().shape({
						translations: Yup.array().of(
							Yup.object().shape({
								value: Yup.string().test({
									name: 'is-required',
									message: intl.formatMessage(
										{ id: 'VALIDATION.REQUIRED' },
										{ field: 'Option' }
									),
									test: function (value) {
										const { parent } = this;
										return (
											!parent.isRequired ||
											(value !== undefined && value.trim() !== '')
										);
									},
								}),
							})
						),
					})
				),
			otherwise: (schema) => schema,
		}),
	});

	// Инициализация начальных значений формы
	const getInitialValues = (): FormValuesType => {
		let initialTranslations: TranslationType[] = [];
		let initialPrompts: PromptType[] = [];
		let initialOptions: OptionType[] = [];

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
				// Предполагаем, что в данных есть prompts, хотя в типе QuestionType их нет
				// В реальном коде нужно адаптировать под фактическую структуру данных
				const existingPrompt = (choosenItem as any)?.prompts?.find(
					(p: any) => p.language_id === lang.id
				);
				return {
					language_id: lang.id,
					language_code: lang.code,
					prompt: existingPrompt?.prompt || '',
					isRequired: true, // Промпты обязательны
				};
			});
		}

		// Определяем тип вопроса
		const questionType = (choosenItem?.type || 'boolean') as QuestionTypeEnum;

		// Если есть существующие варианты ответов, инициализируем их
		if (choosenItem?.options && choosenItem.options.length > 0) {
			initialOptions = choosenItem.options.map((option) => {
				const optionTranslations =
					languages?.map((lang) => {
						const existingTranslation = option.translations.find(
							(t) => t.language_id === lang.id
						);
						return {
							language_id: lang.id,
							language_code: lang.code,
							value: existingTranslation?.value || '',
							isRequired: true,
						};
					}) || [];

				return {
					id: option.id,
					translations: optionTranslations,
				};
			});
		} else {
			// Создаем начальные варианты ответов в зависимости от типа вопроса
			if (questionType === 'boolean' && languages) {
				// Для типа boolean создаем два пустых варианта ответа
				initialOptions = Array.from({ length: 2 }).map(() => ({
					translations: languages.map((lang) => ({
						language_id: lang.id,
						language_code: lang.code,
						value: '',
						isRequired: true,
					})),
				}));
			} else if (questionType === 'select' && languages) {
				// Для типа select создаем три пустых варианта ответа
				initialOptions = Array.from({ length: 3 }).map(() => ({
					translations: languages.map((lang) => ({
						language_id: lang.id,
						language_code: lang.code,
						value: '',
						isRequired: true,
					})),
				}));
			}
		}

		return {
			group: groupId,
			type: questionType,
			translations: initialTranslations,
			prompts: initialPrompts,
			options: initialOptions,
		};
	};

	const formik = useFormik({
		initialValues: getInitialValues(),
		validationSchema,
		enableReinitialize: false, // Отключаем автоматическую реинициализацию
		validateOnChange: true,
		validateOnBlur: true,
		onSubmit: async (values, { setSubmitting, resetForm }) => {
			try {
				const isEdit = type === 'edit' && choosenItem?.id;

				// Проверяем валидность данных перед отправкой
				if (!validateBeforeSubmit(values)) {
					setSubmitting(false);
					return;
				}

				// Получаем валидные переводы и промпты
				const validTranslations = values.translations.filter(
					(t) => t.value.trim() !== ''
				);

				const validPrompts = values.prompts.filter(
					(p) => p.prompt.trim() !== ''
				);

				// Формируем данные для запроса
				const requestData = {
					group: values.group,
					type: values.type,
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

				// Добавляем варианты ответов только для типов boolean и select
				if (values.type !== 'free_answer') {
					(requestData as any).options = values.options.map((option) => ({
						translations: option.translations
							.filter((t) => t.value.trim() !== '')
							.map(({ language_id, language_code, value }) => ({
								language_id,
								language_code,
								value,
							})),
					}));
				}

				if (isEdit) {
					await updateQuestion({ id: choosenItem.id, data: requestData });
				} else {
					await createQuestion(requestData);
				}

				// Сбрасываем состояние
				resetForm();
				setFormIsDirty(false);

				// Обновляем данные на странице вопросов
				refetch();

				toast.success(
					intl.formatMessage({
						id:
							type === 'edit'
								? 'NOTIFICATION.QUESTION.UPDATED'
								: 'NOTIFICATION.QUESTION.CREATED',
					})
				);

				onHide();
			} catch (error) {
				console.error('Error updating/creating question:', error);
				const apiError = error as ApiError;
				notifyError(intl, apiError.response?.status || 500);
			} finally {
				setSubmitting(false);
			}
		},
	});

	// Для отладки
	useEffect(() => {
		console.log('Question form checking for changes...');
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
			setFormIsDirty(false);

			console.log('Initialized form with values:', newInitialValues);
		}
	}, [choosenItem, languages, show, groupId]);

	// Проверяем изменения формы при каждом изменении значений
	useEffect(() => {
		if (initialFormValuesRef.current) {
			const hasChanges = checkFormHasChanged(
				initialFormValuesRef.current,
				formik.values
			);

			console.log('Form has changes:', hasChanges);
			setFormIsDirty(hasChanges);
		}
	}, [formik.values]);

	// Добавление нового варианта ответа
	const handleAddOption = () => {
		if (!languages || formik.values.options.length >= 6) return;

		const newOption: OptionType = {
			translations: languages.map((lang) => ({
				language_id: lang.id,
				language_code: lang.code,
				value: '',
				isRequired: true,
			})),
		};

		formik.setFieldValue('options', [...formik.values.options, newOption]);
	};

	// Удаление варианта ответа
	const handleRemoveOption = (index: number) => {
		// Не позволяем удалять, если количество опций будет меньше 3 для типа select
		if (formik.values.type === 'select' && formik.values.options.length <= 3) {
			toast.error(
				intl.formatMessage(
					{
						id: 'VALIDATION.MIN_OPTIONS',
						defaultMessage: 'Должно быть минимум {count} варианта ответа',
					},
					{ count: 3 }
				)
			);
			return;
		}

		// Не позволяем удалять варианты для типа boolean
		if (formik.values.type === 'boolean') {
			toast.error(
				intl.formatMessage(
					{
						id: 'VALIDATION.EXACT_OPTIONS',
						defaultMessage: 'Должно быть ровно {count} варианта ответа',
					},
					{ count: 2 }
				)
			);
			return;
		}

		const newOptions = [...formik.values.options];
		newOptions.splice(index, 1);
		formik.setFieldValue('options', newOptions);
	};

	// Проверка валидности данных перед отправкой
	const validateBeforeSubmit = (values: FormValuesType): boolean => {
		// Проверяем наличие переводов
		const validTranslations = values.translations.filter(
			(t) => t.value.trim() !== ''
		);

		if (validTranslations.length === 0) {
			toast.error(
				intl.formatMessage(
					{ id: 'VALIDATION.REQUIRED' },
					{
						field: intl.formatMessage(
							{ id: 'COMMON.QUESTIONS' },
							{ defaultMessage: 'Вопросы' }
						),
					}
				)
			);
			return false;
		}

		// Проверяем наличие промптов
		const validPrompts = values.prompts.filter((p) => p.prompt.trim() !== '');

		if (validPrompts.length === 0) {
			toast.error(
				intl.formatMessage(
					{ id: 'VALIDATION.REQUIRED' },
					{
						field: intl.formatMessage(
							{ id: 'COMMON.PROMPTS' },
							{ defaultMessage: 'Промпты' }
						),
					}
				)
			);
			return false;
		}

		// Проверяем варианты ответов для boolean и select
		if (values.type !== 'free_answer') {
			// Для типов boolean и select должны быть варианты ответов
			if (!values.options || values.options.length === 0) {
				toast.error(
					intl.formatMessage(
						{ id: 'VALIDATION.REQUIRED' },
						{
							field: intl.formatMessage({
								id: 'COMMON.ANSWERS',
								defaultMessage: 'Варианты ответов',
							}),
						}
					)
				);
				return false;
			}

			// Проверяем количество вариантов ответов
			if (values.type === 'boolean' && values.options.length !== 2) {
				toast.error(
					intl.formatMessage(
						{
							id: 'VALIDATION.EXACT_OPTIONS',
							defaultMessage: 'Должно быть ровно {count} варианта ответа',
						},
						{ count: 2 }
					)
				);
				return false;
			}

			if (values.type === 'select' && values.options.length < 3) {
				toast.error(
					intl.formatMessage(
						{
							id: 'VALIDATION.MIN_OPTIONS',
							defaultMessage: 'Должно быть минимум {count} варианта ответа',
						},
						{ count: 3 }
					)
				);
				return false;
			}

			// Проверяем, что все варианты ответов имеют переводы
			const invalidOptions = values.options.some(
				(option) =>
					!option.translations ||
					option.translations.every((t) => !t.value || t.value.trim() === '')
			);

			if (invalidOptions) {
				toast.error(
					intl.formatMessage(
						{ id: 'VALIDATION.REQUIRED' },
						{
							field: intl.formatMessage({
								id: 'QUESTION.OPTION_TRANSLATIONS_REQUIRED',
								defaultMessage: 'Переводы вариантов ответов',
							}),
						}
					)
				);
				return false;
			}
		}

		return true;
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
		setFormIsDirty(false);
		onHide();
	};

	const isDisabled = formik.isSubmitting;

	// Создаем кастомные опции для селекта типа вопроса
	const questionTypeOptions: Option[] = [
		{
			value: 1,
			label: intl.formatMessage({
				id: 'QUESTION.TYPE.BOOLEAN',
				defaultMessage: 'Да/Нет',
			}),
		},
		{
			value: 2,
			label: intl.formatMessage({
				id: 'QUESTION.TYPE.SELECT',
				defaultMessage: 'Выбор из вариантов',
			}),
		},
		{
			value: 3,
			label: intl.formatMessage({
				id: 'QUESTION.TYPE.FREE',
				defaultMessage: 'Свободный ответ',
			}),
		},
	];

	// Маппинг значений типа вопроса для селекта
	const typeToValueMap: Record<QuestionTypeEnum, number> = {
		boolean: 1,
		select: 2,
		free_answer: 3,
	};

	// Маппинг значений из селекта в тип вопроса
	const valueToTypeMap: Record<number, QuestionTypeEnum> = {
		1: 'boolean',
		2: 'select',
		3: 'free_answer',
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
					<SDInputSelect
						label={intl.formatMessage({ id: 'COMMON.TYPE' })}
						options={questionTypeOptions}
						value={typeToValueMap[formik.values.type]}
						onChange={(option) => {
							if (option && option.value !== null) {
								const newType = valueToTypeMap[option.value];
								formik.setFieldValue('type', newType);

								// Обновляем варианты ответов в зависимости от типа
								if (newType === 'boolean' && languages) {
									// Для типа boolean создаем два пустых варианта ответа
									formik.setFieldValue(
										'options',
										Array.from({ length: 2 }).map(() => ({
											translations: languages.map((lang) => ({
												language_id: lang.id,
												language_code: lang.code,
												value: '',
												isRequired: true,
											})),
										}))
									);
								} else if (newType === 'select' && languages) {
									// Для типа select создаем три пустых варианта ответа
									formik.setFieldValue(
										'options',
										Array.from({ length: 3 }).map(() => ({
											translations: languages.map((lang) => ({
												language_id: lang.id,
												language_code: lang.code,
												value: '',
												isRequired: true,
											})),
										}))
									);
								} else if (newType === 'free_answer') {
									// Для типа free очищаем варианты ответов
									formik.setFieldValue('options', []);
								}
							}
						}}
						touched={formik.touched.type}
						errors={formik.errors.type as string}
						disabled={isDisabled || type === 'edit'} // Нельзя менять тип при редактировании
						placeholder={intl.formatMessage({ id: 'COMMON.SELECT' })}
						required
					/>
				</div>
			</div>

			{/* Переводы вопроса */}
			<h4 className="fw-bold py-3 mb-2">
				{intl.formatMessage({ id: 'COMMON.OPTIONS' })}
			</h4>
			{languages?.map((lang, index) => (
				<div key={`translation-${lang.id}`} className="col-6 mb-3">
					<SDInput
						maxLength={128}
						label={`${intl.formatMessage({ id: 'COMMON.QUESTION' })} (${lang.name})`}
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

			{/* Промпты вопроса */}
			<h4 className="fw-bold py-3 mb-2">
				{intl.formatMessage({ id: 'COMMON.PROMPTS' })}
			</h4>
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

			{/* Варианты ответов (только для типов boolean и select) */}
			{formik.values.type !== 'free_answer' && (
				<>
					<h4 className="fw-bold py-3 mb-2 d-flex justify-content-between align-items-center">
						<span>
							{intl.formatMessage({
								id: 'COMMON.ANSWERS',
								defaultMessage: 'Варианты ответов',
							})}
						</span>
						{/* Кнопка добавления варианта ответа (только для типа select) */}
						{formik.values.type === 'select' && (
							<button
								type="button"
								className="btn btn-sm btn-light-primary"
								onClick={handleAddOption}
								disabled={isDisabled || formik.values.options.length >= 6}>
								<KTIcon iconName="plus" className="fs-3 me-2" />
								{intl.formatMessage({ id: 'COMMON.ADD' })}
							</button>
						)}
					</h4>

					{formik.values.options.map((option, optionIndex) => (
						<div
							key={`option-${optionIndex}`}
							className="border p-3 mb-3 rounded position-relative">
							{/* Кнопка удаления варианта ответа (только для типа select) */}
							{formik.values.type === 'select' && (
								<button
									type="button"
									className="btn btn-sm btn-icon btn-light-danger position-absolute top-0 end-0 m-2"
									onClick={() => handleRemoveOption(optionIndex)}
									disabled={isDisabled || formik.values.options.length <= 3}>
									<KTIcon iconName="trash" className="fs-3" />
								</button>
							)}

							{languages?.map((lang, langIndex) => (
								<div
									key={`option-${optionIndex}-translation-${lang.id}`}
									className="col-6 mb-3">
									<SDInput
										maxLength={128}
										label={`${intl.formatMessage({ id: 'COMMON.ANSWER', defaultMessage: 'Ответ' })} ${optionIndex + 1} (${lang.name})`}
										name={`options[${optionIndex}].translations[${langIndex}].value`}
										value={
											formik.values.options[optionIndex]?.translations[
												langIndex
											]?.value || ''
										}
										onChange={formik.handleChange}
										onBlur={formik.handleBlur}
										touched={Boolean(
											formik.touched.options &&
												formik.touched.options[optionIndex] &&
												(formik.touched.options[optionIndex] as any)
													?.translations &&
												(formik.touched.options[optionIndex] as any)
													?.translations[langIndex]
										)}
										errors={
											formik.errors.options &&
											typeof formik.errors.options !== 'string' &&
											formik.errors.options[optionIndex] &&
											typeof formik.errors.options[optionIndex] !== 'string' &&
											(formik.errors.options[optionIndex] as any)
												?.translations &&
											(formik.errors.options[optionIndex] as any)?.translations[
												langIndex
											] &&
											typeof (formik.errors.options[optionIndex] as any)
												?.translations[langIndex] === 'object'
												? (
														(formik.errors.options[optionIndex] as any)
															?.translations[langIndex] as any
													)?.value
												: undefined
										}
										required
										disabled={isDisabled}
									/>
								</div>
							))}
						</div>
					))}

					{/* Информация о количестве вариантов ответа */}
					<div className="text-muted fs-7 mb-3">
						{formik.values.type === 'boolean' &&
							intl.formatMessage({
								id: 'QUESTION.BOOLEAN_INFO',
								defaultMessage:
									'Для типа вопроса Да/Нет должно быть ровно 2 варианта ответа',
							})}
						{formik.values.type === 'select' &&
							intl.formatMessage(
								{
									id: 'QUESTION.SELECT_INFO',
									defaultMessage:
										'Для типа вопроса с выбором должно быть от {min} до {max} вариантов ответа',
								},
								{ min: 3, max: 6 }
							)}
					</div>
				</>
			)}

			<SDConfirmationModal
				show={showConfirmationModal}
				onConfirmHide={handleConfirmClose}
				onHide={() => setShowConfirmationModal(false)}
			/>
		</SDOffcanvas>
	);
};

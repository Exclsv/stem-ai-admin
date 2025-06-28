import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useIntl } from 'react-intl';
import { FC, useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { SDConfirmationModal, SDInput, SDOffcanvas } from '../../../components';
import {
	ApiError,
	notifyError,
	LanguageType,
} from '../../../../_metronic/helpers';
import { useCreateStep } from '../../../hooks/step/useCreateStep';
import { useUpdateStep } from '../../../hooks/step/useUpdateStep';
import { StepTypeResponse } from '../types/stepTypes';

type StepDrawerProps = {
	show: boolean;
	onHide: () => void;
	choosenItem?: StepTypeResponse[0] | null;
	setShowDeleteModal?: () => void;
	refetch: () => void;
	type: 'edit' | 'add';
	languages?: LanguageType[];
	projectId: number;
};

type TranslationType = {
	language_id: number;
	language_code?: string;
	value: string;
	isRequired?: boolean;
};

type FormValuesType = {
	project: number;
	order: number;
	translations: TranslationType[];
};

// Функция для проверки изменений в форме
const checkFormHasChanged = (
	initialValues: any,
	currentValues: any
): boolean => {
	// Проверяем изменение порядка
	if (initialValues.order !== currentValues.order) return true;

	// Проверяем изменения в переводах
	const translationsChanged = initialValues.translations.some(
		(t: any, index: number) => {
			return t.value !== currentValues.translations[index]?.value;
		}
	);

	return translationsChanged;
};

export const StepDrawer: FC<StepDrawerProps> = ({
	show,
	onHide,
	choosenItem,
	setShowDeleteModal,
	refetch,
	type,
	languages,
	projectId,
}) => {
	const intl = useIntl();
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);
	const [formIsDirty, setFormIsDirty] = useState(false);

	// Сохраняем начальные значения для сравнения
	const initialFormValuesRef = useRef<FormValuesType | null>(null);

	const { mutateAsync: createStep } = useCreateStep();
	const { mutateAsync: updateStep } = useUpdateStep();

	// Инициализация схемы валидации с проверкой всех переводов
	const validationSchema = Yup.object().shape({
		project: Yup.number().required(
			intl.formatMessage({ id: 'VALIDATION.REQUIRED' }, { field: 'Project' })
		),
		order: Yup.number()
			.required(
				intl.formatMessage({ id: 'VALIDATION.REQUIRED' }, { field: 'Order' })
			)
			.min(
				1,
				intl.formatMessage({ id: 'VALIDATION.MIN_SYMBOLS' }, { count: 1 })
			),
		translations: Yup.array().of(
			Yup.object().shape({
				value: Yup.string()
					.max(
						128,
						intl.formatMessage({ id: 'VALIDATION.MAX_SYMBOLS' }, { count: 128 })
					)
					.test({
						name: 'is-required',
						message: intl.formatMessage(
							{ id: 'VALIDATION.REQUIRED' },
							{ field: 'Name' }
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
	});

	// Инициализация начальных значений формы
	const getInitialValues = (): FormValuesType => {
		let initialTranslations: TranslationType[] = [];

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
		}

		return {
			project: projectId,
			order: choosenItem?.order || 1,
			translations: initialTranslations,
		};
	};

	// Инициализация формика
	const formik = useFormik({
		initialValues: getInitialValues(),
		validationSchema,
		enableReinitialize: false, // Отключаем автоматическую реинициализацию
		validateOnChange: true,
		validateOnBlur: true,
		onSubmit: async (values, { setSubmitting, resetForm }) => {
			try {
				const isEdit = type === 'edit' && choosenItem?.id;

				// Проверяем, есть ли хотя бы один заполненный перевод
				const hasAtLeastOneTranslation = values.translations.some(
					(t) => t.value && t.value.trim() !== ''
				);

				if (!hasAtLeastOneTranslation) {
					toast.error(
						intl.formatMessage(
							{ id: 'VALIDATION.REQUIRED' },
							{ field: intl.formatMessage({ id: 'COMMON.TRANSLATIONS' }) }
						)
					);
					setSubmitting(false);
					return;
				}

				// Формируем данные для запроса
				const requestData = {
					project: values.project,
					order: values.order,
					translations: values.translations
						.filter((t) => t.value.trim() !== '')
						.map(({ language_id, value }) => ({
							language_id,
							value,
						})),
				};

				if (isEdit) {
					await updateStep({ id: choosenItem.id, data: requestData });
				} else {
					await createStep(requestData);
				}

				toast.success(
					intl.formatMessage({
						id:
							type === 'edit'
								? 'NOTIFICATION.STEP.UPDATED'
								: 'NOTIFICATION.STEP.CREATED',
					})
				);

				resetForm();
				setFormIsDirty(false);
				refetch();
				onHide();
			} catch (error) {
				console.error('Error updating/creating step:', error);
				const apiError = error as ApiError;
				notifyError(intl, apiError.response?.status || 500);
			} finally {
				setSubmitting(false);
			}
		},
	});

	// Для отладки
	useEffect(() => {
		console.log('Step form checking for changes...');
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
	}, [choosenItem, languages, show]);

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

	// Обработчик закрытия drawer
	const handleOnHide = () => {
		if (formIsDirty) {
			setShowConfirmationModal(true);
		} else {
			handleConfirmClose();
		}
	};

	// Обработчик подтверждения закрытия drawer
	const handleConfirmClose = () => {
		setShowConfirmationModal(false);
		formik.resetForm();
		setFormIsDirty(false);
		onHide();
	};

	// Флаг блокировки кнопок
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
				<div className="mb-5">
					<SDInput
						type="number"
						min={1}
						label={intl.formatMessage({ id: 'COMMON.ORDER' })}
						name="order"
						value={formik.values.order}
						onChange={formik.handleChange}
						onBlur={formik.handleBlur}
						touched={formik.touched.order}
						errors={formik.errors.order}
						disabled={isDisabled}
						required
					/>
				</div>
			</div>

			{languages?.map((lang, index) => (
				<div key={`translation-${lang.id}`} className="mb-3">
					<SDInput
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
						showCharCounter
						maxLength={128}
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

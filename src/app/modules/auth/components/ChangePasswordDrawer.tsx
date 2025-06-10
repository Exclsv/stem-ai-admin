import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useIntl } from 'react-intl';
import { FC, useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { SDConfirmationModal, SDInput, SDOffcanvas } from '../../../components';
import { ApiError, notifyError } from '../../../../_metronic/helpers';
import { changePassword } from '../core/_requests';

type Props = {
	show: boolean;
	onHide: () => void;
};

type FormValuesType = {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
};

// Функция для проверки изменений в форме
const checkFormHasChanged = (
	initialValues: any,
	currentValues: any
): boolean => {
	// Проверяем изменения в полях пароля
	return (
		initialValues.currentPassword !== currentValues.currentPassword ||
		initialValues.newPassword !== currentValues.newPassword ||
		initialValues.confirmPassword !== currentValues.confirmPassword
	);
};

export const ChangePasswordDrawer: FC<Props> = ({ show, onHide }) => {
	const intl = useIntl();
	const [loading, setLoading] = useState(false);
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);
	const [formIsDirty, setFormIsDirty] = useState(false);

	// Сохраняем начальные значения для сравнения
	const initialFormValuesRef = useRef<FormValuesType | null>(null);

	// Инициализация схемы валидации
	const validationSchema = Yup.object().shape({
		currentPassword: Yup.string()
			.min(
				3,
				intl.formatMessage({ id: 'VALIDATION.MIN_SYMBOLS' }, { count: 3 })
			)
			.max(
				50,
				intl.formatMessage({ id: 'VALIDATION.MAX_SYMBOLS' }, { count: 50 })
			)
			.required(
				intl.formatMessage(
					{ id: 'VALIDATION.REQUIRED' },
					{ field: intl.formatMessage({ id: 'AUTH.CURRENT_PASSWORD' }) }
				)
			),
		newPassword: Yup.string()
			.min(
				3,
				intl.formatMessage({ id: 'VALIDATION.MIN_SYMBOLS' }, { count: 3 })
			)
			.max(
				50,
				intl.formatMessage({ id: 'VALIDATION.MAX_SYMBOLS' }, { count: 50 })
			)
			.required(
				intl.formatMessage(
					{ id: 'VALIDATION.REQUIRED' },
					{ field: intl.formatMessage({ id: 'AUTH.NEW_PASSWORD' }) }
				)
			),
		confirmPassword: Yup.string()
			.min(
				3,
				intl.formatMessage({ id: 'VALIDATION.MIN_SYMBOLS' }, { count: 3 })
			)
			.max(
				50,
				intl.formatMessage({ id: 'VALIDATION.MAX_SYMBOLS' }, { count: 50 })
			)
			.required(
				intl.formatMessage(
					{ id: 'VALIDATION.REQUIRED' },
					{ field: intl.formatMessage({ id: 'AUTH.CONFIRM_PASSWORD' }) }
				)
			)
			.oneOf(
				[Yup.ref('newPassword')],
				intl.formatMessage({ id: 'AUTH.PASSWORDS_NOT_MATCH' })
			),
	});

	// Инициализация начальных значений формы
	const getInitialValues = (): FormValuesType => {
		return {
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		};
	};

	// Инициализация формика
	const formik = useFormik({
		initialValues: getInitialValues(),
		validationSchema,
		enableReinitialize: false,
		validateOnChange: true,
		validateOnBlur: true,
		onSubmit: async (values, { setSubmitting, resetForm }) => {
			setLoading(true);
			try {
				await changePassword(values.currentPassword, values.newPassword);
				toast.success(
					intl.formatMessage({
						id: 'AUTH.PASSWORD_CHANGED_SUCCESSFULLY',
						defaultMessage: 'Пароль успешно изменен',
					})
				);
				resetForm();
				setFormIsDirty(false);
				onHide();
			} catch (error) {
				console.error('Error changing password:', error);
				const apiError = error as ApiError;
				notifyError(intl, apiError.response?.status || 500);
				toast.error(
					intl.formatMessage({
						id: 'AUTH.PASSWORD_CHANGE_ERROR',
						defaultMessage: 'Ошибка при изменении пароля',
					})
				);
			} finally {
				setSubmitting(false);
				setLoading(false);
			}
		},
	});

	// Устанавливаем начальные значения при открытии
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
		}
	}, [show]);

	// Проверяем изменения формы при каждом изменении значений
	useEffect(() => {
		if (initialFormValuesRef.current) {
			const hasChanges = checkFormHasChanged(
				initialFormValuesRef.current,
				formik.values
			);
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
	const isDisabled = formik.isSubmitting || loading;

	return (
		<>
			<SDOffcanvas
				show={show}
				onHide={handleOnHide}
				title={intl.formatMessage({
					id: 'AUTH.CHANGE_PASSWORD',
					defaultMessage: 'Изменить пароль',
				})}
				width={'w-25'}
				onClick={() => formik.handleSubmit()}>
				<div className="row">
					<div className="col-12 mb-5">
						<SDInput
							type="password"
							label={intl.formatMessage({
								id: 'AUTH.CURRENT_PASSWORD',
								defaultMessage: 'Текущий пароль',
							})}
							name="currentPassword"
							value={formik.values.currentPassword}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							touched={formik.touched.currentPassword}
							errors={formik.errors.currentPassword}
							disabled={isDisabled}
							required
						/>
					</div>
					<div className="col-12 mb-5">
						<SDInput
							type="password"
							label={intl.formatMessage({
								id: 'AUTH.NEW_PASSWORD',
								defaultMessage: 'Новый пароль',
							})}
							name="newPassword"
							value={formik.values.newPassword}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							touched={formik.touched.newPassword}
							errors={formik.errors.newPassword}
							disabled={isDisabled}
							required
						/>
					</div>
					<div className="col-12 mb-5">
						<SDInput
							type="password"
							label={intl.formatMessage({
								id: 'AUTH.CONFIRM_PASSWORD',
								defaultMessage: 'Подтвердите новый пароль',
							})}
							name="confirmPassword"
							value={formik.values.confirmPassword}
							onChange={formik.handleChange}
							onBlur={formik.handleBlur}
							touched={formik.touched.confirmPassword}
							errors={formik.errors.confirmPassword}
							disabled={isDisabled}
							required
						/>
					</div>
				</div>

				<SDConfirmationModal
					show={showConfirmationModal}
					onConfirmHide={handleConfirmClose}
					onHide={() => setShowConfirmationModal(false)}
				/>
			</SDOffcanvas>
		</>
	);
};

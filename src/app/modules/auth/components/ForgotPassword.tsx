import { useState } from 'react';
import * as Yup from 'yup';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { toAbsoluteUrl } from '../../../../_metronic/helpers';
import { requestPassword } from '../core/_requests';
import { useIntl } from 'react-intl';
import { toast } from 'react-toastify';

const forgotPasswordSchema = Yup.object().shape({
	email: Yup.string()
		.email('Неверный формат email')
		.min(3, 'Минимум 3 символа')
		.max(50, 'Максимум 50 символов')
		.required('Email обязателен'),
});

const initialValues = {
	email: '',
};

export function ForgotPassword() {
	const intl = useIntl();
	const [loading, setLoading] = useState(false);
	const [hasErrors, setHasErrors] = useState<boolean | undefined>(undefined);
	const [successMessage, setSuccessMessage] = useState<string | undefined>(
		undefined
	);

	const formik = useFormik({
		initialValues,
		validationSchema: forgotPasswordSchema,
		onSubmit: async (values, { setStatus, setSubmitting }) => {
			setLoading(true);
			setHasErrors(undefined);
			setSuccessMessage(undefined);
			try {
				await requestPassword(values.email);
				setHasErrors(false);
				setSuccessMessage('Ссылка для сброса пароля отправлена на вашу почту');
				toast.success(
					'Письмо со ссылкой для сброса пароля отправлено на вашу почту'
				);
			} catch (error) {
				console.error(error);
				setHasErrors(true);
				setStatus('Произошла ошибка при отправке запроса на сброс пароля');
				toast.error('Произошла ошибка при отправке запроса на сброс пароля');
			} finally {
				setSubmitting(false);
				setLoading(false);
			}
		},
	});

	return (
		<form
			className="form w-100"
			onSubmit={formik.handleSubmit}
			noValidate
			id="kt_password_reset_form">
			<div className="text-center mb-11">
				<Link to="/" className="mb-12">
					<img
						alt="Logo"
						src={toAbsoluteUrl('media/logos/custom-1.svg')}
						className="h-75px"
					/>
				</Link>

				<h1 className="text-gray-900 fw-bolder mb-3">Забыли пароль?</h1>
				<div className="text-gray-500 fw-semibold fs-6">
					Введите ваш email, чтобы сбросить пароль
				</div>
			</div>

			{hasErrors === true && (
				<div className="mb-lg-15 alert alert-danger">
					<div className="alert-text font-weight-bold">
						Произошла ошибка при отправке запроса на сброс пароля
					</div>
				</div>
			)}

			{hasErrors === false && successMessage && (
				<div className="mb-lg-15 alert alert-success">
					<div className="alert-text font-weight-bold">{successMessage}</div>
				</div>
			)}

			<div className="fv-row mb-8">
				<label className="form-label fs-6 fw-bolder text-gray-900">Email</label>
				<input
					type="email"
					placeholder="Email"
					autoComplete="off"
					{...formik.getFieldProps('email')}
					className={clsx(
						'form-control bg-transparent',
						{ 'is-invalid': formik.touched.email && formik.errors.email },
						{
							'is-valid': formik.touched.email && !formik.errors.email,
						}
					)}
				/>
				{formik.touched.email && formik.errors.email && (
					<div className="fv-plugins-message-container">
						<div className="fv-help-block">
							<span role="alert">{formik.errors.email}</span>
						</div>
					</div>
				)}
			</div>

			<div className="d-flex flex-wrap justify-content-center pb-lg-0">
				<button
					type="submit"
					id="kt_password_reset_submit"
					className="btn btn-primary me-4"
					disabled={formik.isSubmitting || !formik.isValid}>
					{!loading && <span className="indicator-label">Отправить</span>}
					{loading && (
						<span className="indicator-progress" style={{ display: 'block' }}>
							Пожалуйста, подождите...
							<span className="spinner-border spinner-border-sm align-middle ms-2"></span>
						</span>
					)}
				</button>
				<Link to="/auth/login">
					<button
						type="button"
						id="kt_login_password_reset_form_cancel_button"
						className="btn btn-light"
						disabled={formik.isSubmitting}>
						Отмена
					</button>
				</Link>
			</div>
		</form>
	);
}

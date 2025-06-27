import { useState } from 'react';
import * as Yup from 'yup';
import clsx from 'clsx';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { getUserByToken, login } from '../core/_requests';
import { toAbsoluteUrl } from '../../../../_metronic/helpers';
import { useAuth } from '../core/Auth';
import { useIntl } from 'react-intl';
import { toast } from 'react-toastify';

const loginSchema = Yup.object().shape({
	username: Yup.string()
		.min(3, 'Minimum 3 symbols')
		.max(50, 'Maximum 50 symbols')
		.required('Username is required'),
	password: Yup.string()
		.min(3, 'Minimum 3 symbols')
		.max(50, 'Maximum 50 symbols')
		.required('Password is required'),
});

const initialValues = {
	username: 'admin',
	password: 'admin1254',
};

export function Login() {
	const intl = useIntl();

	const [loading, setLoading] = useState(false);
	const { saveAuth, setCurrentUser } = useAuth();

	const formik = useFormik({
		initialValues,
		validationSchema: loginSchema,
		onSubmit: async (values, { setStatus, setSubmitting }) => {
			setLoading(true);
			try {
				const { data: auth } = await login(values.username, values.password);
				saveAuth(auth);
				const { data: user } = await getUserByToken(auth.access);
				const userInfo = {
					id: 1,
					username: 'admin',
					password: 'admin12345',
					email: 'admin@gmail.com',
					first_name: 'admin',
					last_name: 'admin',
				};
				setCurrentUser(userInfo);
				toast.success(
					intl.formatMessage({
						id: 'SUCCESS.LOGIN',
					})
				);
			} catch (error) {
				console.error(error);
				saveAuth(undefined);
				setStatus('The login details are incorrect');
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
			id="kt_login_signin_form">
			<div className="text-center mb-11">
				<Link to="/" className="mb-12">
					<img
						alt="Logo"
						src={toAbsoluteUrl('media/logos/custom-1.svg')}
						className="h-75px"
					/>
				</Link>
			</div>

			<div className="fv-row mb-8">
				<label className="form-label fs-6 fw-bolder text-gray-900">
					{intl.formatMessage({ id: 'COMMON.USERNAME' })}
				</label>
				<input
					placeholder="Username"
					{...formik.getFieldProps('username')}
					className={clsx(
						'form-control bg-transparent',
						{ 'is-invalid': formik.touched.username && formik.errors.username },
						{
							'is-valid': formik.touched.username && !formik.errors.username,
						}
					)}
					type="text"
					name="username"
					autoComplete="off"
				/>
				{formik.touched.username && formik.errors.username && (
					<div className="fv-plugins-message-container">
						<span role="alert">{formik.errors.username}</span>
					</div>
				)}
			</div>
			<div className="fv-row mb-3">
				<label className="form-label fw-bolder text-gray-900 fs-6">
					{intl.formatMessage({ id: 'COMMON.PASSWORD' })}
				</label>
				<input
					type="password"
					autoComplete="off"
					{...formik.getFieldProps('password')}
					className={clsx(
						'form-control bg-transparent',
						{
							'is-invalid': formik.touched.password && formik.errors.password,
						},
						{
							'is-valid': formik.touched.password && !formik.errors.password,
						}
					)}
				/>
				{formik.touched.password && formik.errors.password && (
					<div className="fv-plugins-message-container">
						<div className="fv-help-block">
							<span role="alert">{formik.errors.password}</span>
						</div>
					</div>
				)}
			</div>

			<div className="d-flex flex-stack flex-wrap gap-3 fs-base fw-semibold mb-8">
				<div></div>
				<Link to="/auth/forgot-password" className="link-primary">
					Забыли пароль?
				</Link>
			</div>

			<div className="d-grid mb-10 mt-10">
				<button
					type="submit"
					id="kt_sign_in_submit"
					className="btn btn-primary"
					disabled={formik.isSubmitting || !formik.isValid}>
					{!loading && (
						<span className="indicator-label">
							{intl.formatMessage({ id: 'COMMON.SING_IN' })}
						</span>
					)}
					{loading && (
						<span className="indicator-progress" style={{ display: 'block' }}>
							Please wait...
							<span className="spinner-border spinner-border-sm align-middle ms-2"></span>
						</span>
					)}
				</button>
			</div>
		</form>
	);
}

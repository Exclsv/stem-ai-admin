import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useIntl } from 'react-intl';
import { FC, useState } from 'react';
import { toast } from 'react-toastify';
import {
	SDConfirmationModal,
	SDInput,
	SDOffcanvas,
	SDTextarea,
} from '../../../components';
import {
	ApiError,
	notifyError,
	LanguageType,
} from '../../../../_metronic/helpers';
import { useCreateLanguage } from '../../../hooks/language/useCreateLanguage.ts';
import { useUpdateLanguage } from '../../../hooks/language/useUpdateLanguage.ts';

type AddOrEditOffcanvasProps = {
	show: boolean;
	onHide: () => void;
	choosenItem: LanguageType | null;
	setShowDeleteModal?: () => void;
	refetch: () => void;
	type: 'edit' | 'add';
};

export const AddOrEditOffcanvas: FC<AddOrEditOffcanvasProps> = ({
	show,
	onHide,
	choosenItem,
	setShowDeleteModal,
	refetch,
	type,
}) => {
	const intl = useIntl();
	const [showConfirmationModal, setShowConfirmationModal] = useState(false);

	const { mutateAsync: createLanguage } = useCreateLanguage();
	const { mutateAsync: updateLanguage } = useUpdateLanguage();

	const validationSchema = Yup.object({
		name: Yup.string()
			.required(intl.formatMessage({ id: 'VALIDATION.REQUIRED' }))
			.max(50, intl.formatMessage({ id: 'VALIDATION.MAX_SYMBOLS' })),
		code: Yup.string()
			.required(intl.formatMessage({ id: 'VALIDATION.REQUIRED' }))
			.max(10, intl.formatMessage({ id: 'VALIDATION.MAX_SYMBOLS' })),
	});

	const initialValues = {
		name: choosenItem?.name ?? '',
		code: choosenItem?.code ?? '',
	};

	const formik = useFormik({
		initialValues,
		enableReinitialize: true,
		validationSchema,
		onSubmit: async (values, { setSubmitting }) => {
			const isEdit = type === 'edit' && choosenItem?.id;

			try {
				if (isEdit) {
					await updateLanguage({ id: choosenItem.id, data: values });
				} else {
					await createLanguage(values);
				}
				handleConfirmClose();
				refetch();
				toast.success(
					intl.formatMessage({
						id:
							type === 'edit'
								? 'NOTIFICATION.LANGUAGE.UPDATED'
								: 'NOTIFICATION.LANGUAGE.CREATED',
					})
				);
			} catch (error) {
				const apiError = error as ApiError;
				notifyError(intl, apiError.response.status);
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
		onHide();
	};

	const isDisabled = false;

	return (
		<SDOffcanvas
			show={show}
			onHide={handleOnHide}
			title={intl.formatMessage({
				id: type === 'add' ? 'COMMON.ADD' : 'COMMON.EDIT',
			})}
			width={'w-30'}
			onClick={() => formik.handleSubmit()}
			dropdownItems={
				<li>
					<button className="btn dropdown-item" onClick={setShowDeleteModal}>
						{intl.formatMessage({ id: 'COMMON.DELETE' })}
					</button>
				</li>
			}>
			<div className="col-12 mb-3 mt-3">
				<SDInput
					label={intl.formatMessage({ id: 'COMMON.NAME' })}
					{...formik.getFieldProps('name')}
					touched={formik.touched.name}
					errors={formik.errors.name}
					required
					disabled={isDisabled}
					maxLength={50}
					showCharCounter
				/>
			</div>
			<div className="col-12 mb-3 mt-3">
				<SDInput
					label={intl.formatMessage({ id: 'COMMON.CODE' })}
					{...formik.getFieldProps('code')}
					touched={formik.touched.code}
					errors={formik.errors.code}
					required
					disabled={isDisabled}
					maxLength={10}
					showCharCounter
				/>
			</div>

			<SDConfirmationModal
				show={showConfirmationModal}
				onConfirmHide={handleConfirmClose}
				onHide={() => setShowConfirmationModal(false)}
			/>
		</SDOffcanvas>
	);
};

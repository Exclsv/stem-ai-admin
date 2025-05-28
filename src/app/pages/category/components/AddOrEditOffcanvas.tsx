import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useIntl } from 'react-intl';
import { FC, useState } from 'react';
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
	OptionType,
} from '../../../../_metronic/helpers';
import { useCreateCategory } from '../../../hooks/category/useCreateCategory.ts';
import { useUpdateCategory } from '../../../hooks/category/useUpdateCategory.ts';

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
	value: string;
};

type initialValuesType = {
	parent_category: number | null;
	image: string;
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

	const { mutateAsync: createCategory } = useCreateCategory();
	const { mutateAsync: updateCategory } = useUpdateCategory();

	const validationSchema = Yup.object().shape({
		parent_category: Yup.number()
			.required(intl.formatMessage({ id: 'VALIDATION.REQUIRED' }))
			.max(24, intl.formatMessage({ id: 'VALIDATION.MAX_SYMBOLS' })),
		image: Yup.mixed().required(
			intl.formatMessage({ id: 'VALIDATION.REQUIRED' })
		),
	});

	const initialValues: initialValuesType = {
		parent_category: choosenItem?.parent_category?.id || null,
		image: choosenItem?.image || '',
		translations: [],
		prompts: [],
	};

	const formik = useFormik({
		initialValues,
		enableReinitialize: true,
		validationSchema,
		onSubmit: async (values, { setSubmitting }) => {
			const isEdit = type === 'edit' && choosenItem?.id;

			const newData = {
				...values,
				translations,
				prompts,
			};

			try {
				if (isEdit) {
					await updateCategory({ id: choosenItem.id, data: newData });
				} else {
					await createCategory(newData);
				}
				handleConfirmClose();
				refetch();
				toast.success(
					intl.formatMessage({
						id:
							type === 'edit' ? 'NOTIFICATION.UPDATED' : 'NOTIFICATION.CREATED',
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

	console.log('prompts', prompts);

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
				<li>
					<button className="btn dropdown-item" onClick={setShowDeleteModal}>
						{intl.formatMessage({ id: 'COMMON.DELETE' })}
					</button>
				</li>
			}>
			<div className="row">
				<div className="col-6 mb-5">
					<SDInput
						type="file"
						maxLength={128}
						label={intl.formatMessage({ id: 'COMMON.IMAGE' })}
						{...formik.getFieldProps('image')}
						touched={formik.touched.image}
						errors={formik.errors.image}
						required
						disabled={isDisabled}
					/>
				</div>
				<div className="col-6 mb-5">
					<SDInputSelect
						label={intl.formatMessage({ id: 'COMMON.PARENT_CATEGORY' })}
						options={(languages ?? []).map((item) => ({
							value: item.id,
							label: item.name,
						}))}
						value={formik.values.parent_category}
						onChange={(option) => {
							console.log(option);
							formik.setFieldValue('parent_category', option?.value);
						}}
						touched={formik.touched.parent_category}
						errors={formik.errors.parent_category}
						disabled={isDisabled}
					/>
				</div>
			</div>

			{languages?.map((lang, index) => (
				<div className="col-6 mb-3">
					<SDInput
						maxLength={128}
						label={`${intl.formatMessage({ id: 'COMMON.NAME' })} (${lang.name})`}
						touched={formik.touched.translations?.[index]?.value}
						errors={formik.errors.translations?.[index]}
						required
						disabled={isDisabled}
						value={translations[index]?.value}
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
				<div className="col-6 mb-3">
					<SDTextarea
						maxLength={128}
						label={`${intl.formatMessage({ id: 'COMMON.PROMPT' })} (${lang.name})`}
						touched={formik.touched.prompts?.[index]?.value}
						errors={formik.errors.prompts?.[index]}
						required
						disabled={isDisabled}
						value={prompts[index]?.value}
						onChange={(e) => {
							setPrompts((prev) => {
								const newPrompts = [...prev];
								newPrompts[index] = {
									...newPrompts[index],
									value: e.target.value,
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

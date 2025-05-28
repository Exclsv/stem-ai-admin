import { FC, useId } from 'react';
import Select, { StylesConfig, Props as SelectProps } from 'react-select';

export type Option = {
	label: string;
	value: number | null;
	[key: string]: unknown;
};

const SDSelectStyles: StylesConfig<Option, false> = {
	control: (styles) => ({
		...styles,
		padding: 0,
		border: '1px solid #ced4da',
		borderRadius: '0.375rem',
	}),
	input: (styles) => ({
		...styles,
		padding: 0,
		fontSize: '1rem',
		fontWeight: 500,
		lineHeight: 1.5,
		zIndex: 999,
	}),
	valueContainer: (styles) => ({ ...styles, padding: '0.775rem 1rem' }),
};

interface SDInputSelectProps
	extends Omit<SelectProps<Option, false>, 'value' | 'onChange'> {
	label?: string;
	touched?: boolean;
	errors?: string;
	required?: boolean;
	className?: string;
	disabled?: boolean;
	options: Option[];
	value?: Option | number | null;
	onChange?: (option: Option | null) => void;
}

export const SDInputSelect: FC<SDInputSelectProps> = ({
	label,
	touched,
	errors,
	options = [],
	value,
	onChange,
	disabled = false,
	required = false,
	isSearchable = true,
	className = '',
	...rest
}) => {
	const id = useId();
	const isError = touched && !!errors;

	const controlClass = [
		'form-control p-0',
		touched && !errors ? 'border-success' : '',
		touched && errors ? 'border-danger' : '',
		disabled ? 'sd-select-disabled' : '',
	]
		.filter(Boolean)
		.join(' ');

	return (
		<>
			{label && (
				<label htmlFor={id} className="form-label d-flex align-items-end">
					{label}
					{required && (
						<span className="text-danger ms-1" style={{ marginBottom: '1px' }}>
							*
						</span>
					)}
				</label>
			)}

			<Select
				inputId={id}
				styles={SDSelectStyles}
				placeholder=""
				className={`react-select-styled react-select-solid ${className}`}
				classNames={{ control: () => controlClass }}
				components={{ IndicatorSeparator: () => null }}
				options={options}
				onChange={onChange}
				value={options?.find((x) => x.value === value) || null}
				isDisabled={disabled}
				isSearchable={isSearchable}
				{...rest}
			/>

			{isError && <div className="text-danger">{errors}</div>}
		</>
	);
};

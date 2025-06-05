import clsx from 'clsx';
import { ReactNode, FC, InputHTMLAttributes } from 'react';

interface SDInputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	touched?: boolean;
	errors?: string | { value?: string };
	required?: boolean;
	labelChild?: ReactNode;
	helpText?: string;
}

export const SDInput: FC<SDInputProps> = ({
	name = 'input',
	type = 'text',
	value,
	label,
	onChange,
	touched,
	errors,
	required = false,
	labelChild,
	className,
	minLength,
	maxLength,
	max,
	min,
	disabled,
	helpText,
	...props
}) => {
	const errorMessage = typeof errors === 'string' ? errors : errors?.value;
	const isError = touched && !!errorMessage;
	const isValid = touched && !errorMessage;

	const isDisabled = () => {
		return disabled;
	};

	return (
		<>
			<div className="d-flex align-items-center">
				{label && (
					<label className="form-label">
						{label}
						{required && (
							<span className="text-danger" style={{ marginBottom: '1px' }}>
								*
							</span>
						)}
					</label>
				)}
				{labelChild && <>{labelChild}</>}
			</div>
			<input
				name={name}
				type={type}
				onChange={onChange}
				value={value}
				minLength={minLength}
				maxLength={maxLength}
				max={max}
				min={min}
				className={clsx('form-control', className, {
					'is-invalid sd-is-invalid': isError,
					'is-valid sd-is-valid': isValid,
					'sd-is-disabled': disabled,
				})}
				disabled={isDisabled()}
				{...props}
			/>
			{isError && (
				<div id={`${name}-error`} className="text-danger">
					{errorMessage}
				</div>
			)}
			{helpText && !isError && (
				<div className="form-text text-muted small mt-1">{helpText}</div>
			)}
		</>
	);
};

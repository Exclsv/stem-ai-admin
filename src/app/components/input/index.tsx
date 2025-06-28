import clsx from 'clsx';
import { ReactNode, FC, InputHTMLAttributes, useState, useEffect } from 'react';
import { SDCharCounter } from '../char-counter';

interface SDInputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	touched?: boolean;
	errors?: string | { value?: string };
	required?: boolean;
	labelChild?: ReactNode;
	helpText?: string;
	showCharCounter?: boolean;
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
	showCharCounter = false,
	...props
}) => {
	const errorMessage = typeof errors === 'string' ? errors : errors?.value;
	const isError = touched && !!errorMessage;
	const isValid = touched && !errorMessage;
	const [charCount, setCharCount] = useState(0);

	useEffect(() => {
		if (value && typeof value === 'string') {
			setCharCount(value.length);
		} else {
			setCharCount(0);
		}
	}, [value]);

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
			<div className="d-flex justify-content-between mt-1">
				{isError && (
					<div className="text-danger align-self-start">{errorMessage}</div>
				)}
				{showCharCounter && maxLength && (
					<SDCharCounter
						current={charCount}
						max={maxLength}
						className="text-end ms-auto"
					/>
				)}
			</div>
			{helpText && !isError && (
				<div className="form-text text-muted small mt-1">{helpText}</div>
			)}
		</>
	);
};

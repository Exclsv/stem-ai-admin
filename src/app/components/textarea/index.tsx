import React, {
	TextareaHTMLAttributes,
	ChangeEventHandler,
	useRef,
	useEffect,
} from 'react';
import clsx from 'clsx';

interface SDTextareaProps
	extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
	value?: string;
	onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
	label?: string;
	errors?: string | { value?: string };
	className?: string;
	touched?: boolean;
	required?: boolean;
	maxLength?: number;
}

const SDTextarea: React.FC<SDTextareaProps> = ({
	value,
	maxLength = 255,
	onChange,
	label,
	errors,
	touched,
	className,
	required = false,
	...props
}) => {
	const isError = touched && !!errors;
	const isValid = touched && !errors;
	const errorMessage = typeof errors === 'string' ? errors : errors?.value;

	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Функция для автоматического увеличения высоты
	const adjustHeight = () => {
		if (textareaRef.current) {
			textareaRef.current.style.height = 'auto'; // Сброс высоты
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Установка высоты
		}
	};

	// Внутренний обработчик изменений
	const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
		onChange(event); // Передаем изменение наружу
		adjustHeight(); // Регулируем высоту
	};

	// Следим за изменением value из пропсов
	useEffect(() => {
		adjustHeight();
	}, [value]);

	return (
		<>
			{label && (
				<label className="form-label">
					{label}
					{required && <span className="text-danger">*</span>}
				</label>
			)}
			<textarea
				ref={textareaRef} // Привязываем ref
				maxLength={maxLength}
				value={value} // Используем значение из пропсов
				onChange={handleChange} // Обработчик изменений
				className={clsx('form-control sd-no-resize', className, {
					'is-invalid sd-is-invalid': isError,
					'is-valid sd-is-valid': isValid,
					'sd-is-disabled': props.disabled,
				})}
				style={{ overflow: 'hidden' }} // Скрываем прокрутку
				{...props}
			/>
			{isError && <div className="text-danger">{errorMessage}</div>}
		</>
	);
};

export { SDTextarea };

import React, {
	TextareaHTMLAttributes,
	ChangeEventHandler,
	useRef,
	useEffect,
	useState,
} from 'react';
import clsx from 'clsx';
import { SDCharCounter } from '../char-counter';

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
	showCharCounter?: boolean;
	maxRows?: number;
	minRows?: number;
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
	showCharCounter = false,
	maxRows = 7,
	minRows = 2,
	...props
}) => {
	const isError = touched && !!errors;
	const isValid = touched && !errors;
	const errorMessage = typeof errors === 'string' ? errors : errors?.value;
	const [charCount, setCharCount] = useState(0);
	const [initialMinHeight, setInitialMinHeight] = useState<number>(0);

	const textareaRef = useRef<HTMLTextAreaElement>(null);

	// Функция для автоматического увеличения высоты с ограничением
	const adjustHeight = () => {
		if (textareaRef.current) {
			const textarea = textareaRef.current;

			// Временно сбрасываем высоту для получения правильного scrollHeight
			textarea.style.height = 'auto';
			textarea.style.overflowY = 'hidden';

			// Вычисляем высоту одной строки
			const computedStyle = window.getComputedStyle(textarea);
			const lineHeight =
				parseInt(computedStyle.lineHeight) ||
				parseInt(computedStyle.fontSize) * 1.2;

			// Вычисляем минимальную и максимальную высоту
			const minHeight = lineHeight * minRows;
			const maxHeight = lineHeight * maxRows;

			// Получаем необходимую высоту контента
			const scrollHeight = textarea.scrollHeight;

			if (scrollHeight <= maxHeight) {
				// Если контент помещается в максимальную высоту, растягиваем без скролла
				textarea.style.height = `${Math.max(scrollHeight, minHeight)}px`;
				textarea.style.overflowY = 'hidden';
			} else {
				// Если контент превышает максимальную высоту, фиксируем высоту и включаем скролл
				textarea.style.height = `${maxHeight}px`;
				textarea.style.overflowY = 'auto';
			}
		}
	};

	// Внутренний обработчик изменений
	const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
		onChange(event); // Передаем изменение наружу
		adjustHeight(); // Регулируем высоту
		setCharCount(event.target.value.length);
	};

	// Инициализация минимальной высоты
	useEffect(() => {
		if (textareaRef.current && initialMinHeight === 0) {
			const textarea = textareaRef.current;
			const computedStyle = window.getComputedStyle(textarea);
			const lineHeight =
				parseInt(computedStyle.lineHeight) ||
				parseInt(computedStyle.fontSize) * 1.2;
			const minHeight = lineHeight * minRows;
			setInitialMinHeight(minHeight);
		}
	}, [minRows, initialMinHeight]);

	// Следим за изменением value из пропсов
	useEffect(() => {
		adjustHeight();
		if (value) {
			setCharCount(value.length);
		} else {
			setCharCount(0);
		}
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
				value={value} // Используем значение из пропсов
				onChange={handleChange} // Обработчик изменений
				className={clsx('form-control sd-no-resize', className, {
					'is-invalid sd-is-invalid': isError,
					'is-valid sd-is-valid': isValid,
					'sd-is-disabled': props.disabled,
				})}
				style={{
					resize: 'none', // Запрещаем ручное изменение размера
					minHeight: initialMinHeight > 0 ? `${initialMinHeight}px` : 'auto',
				}}
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
		</>
	);
};

export { SDTextarea };

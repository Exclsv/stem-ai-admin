import React from 'react';
import Select, {
	StylesConfig,
	SingleValue,
	MultiValue,
	ActionMeta,
} from 'react-select';

export interface OptionType {
	value: string | number;
	label: string;
}

interface SDSelectProps {
	label?: string;
	name?: string;
	value?: string | number;
	options: OptionType[];
	onChange?: (value: string | number | null) => void;
	onBlur?: (e: React.FocusEvent) => void;
	touched?: boolean;
	errors?: string;
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
	isClearable?: boolean;
	isLoading?: boolean;
	isSearchable?: boolean;
	className?: string;
}

const SDSelect: React.FC<SDSelectProps> = ({
	label,
	name,
	value,
	options,
	onChange,
	onBlur,
	touched,
	errors,
	placeholder = 'Выберите...',
	required = false,
	disabled = false,
	isClearable = false,
	isLoading = false,
	isSearchable = false,
	className = '',
}) => {
	// Находим выбранную опцию
	const selectedOption =
		options.find((option) => option.value === value) || null;

	// Обработчик изменения значения
	const handleChange = (
		newValue: SingleValue<OptionType> | MultiValue<OptionType>,
		actionMeta: ActionMeta<OptionType>
	) => {
		if (onChange) {
			// Поскольку мы используем single select, newValue всегда будет SingleValue
			const singleValue = newValue as SingleValue<OptionType>;
			onChange(singleValue ? singleValue.value : null);
		}
	};

	// Кастомные стили для react-select
	const customStyles: StylesConfig<OptionType> = {
		control: (provided, state) => ({
			...provided,
			backgroundColor: '#f8f9fa',
			border: `1px solid ${
				touched && errors ? '#dc3545' : state.isFocused ? '#80bdff' : '#e4e6ea'
			}`,
			borderRadius: '0.475rem',
			minHeight: '44px',
			fontSize: '13px',
			fontWeight: '500',
			color: '#181c32',
			cursor: isSearchable ? 'text' : 'pointer',
			boxShadow: state.isFocused
				? touched && errors
					? '0 0 0 0.2rem rgba(220, 53, 69, 0.25)'
					: '0 0 0 0.2rem rgba(0, 123, 255, 0.25)'
				: 'none',
			'&:hover': {
				borderColor: touched && errors ? '#dc3545' : '#80bdff',
			},
		}),
		valueContainer: (provided) => ({
			...provided,
			padding: '0 12px',
		}),
		input: (provided) => ({
			...provided,
			margin: '0',
			fontSize: '13px',
			fontWeight: '500',
			color: '#181c32',
		}),
		placeholder: (provided) => ({
			...provided,
			fontSize: '13px',
			fontWeight: '500',
			color: '#a1a5b7',
		}),
		singleValue: (provided) => ({
			...provided,
			fontSize: '13px',
			fontWeight: '500',
			color: '#181c32',
		}),
		menu: (provided) => ({
			...provided,
			backgroundColor: '#ffffff',
			border: '1px solid #e4e6ea',
			borderRadius: '0.475rem',
			boxShadow: '0 0.5rem 1.5rem 0.5rem rgba(0, 0, 0, 0.075)',
			zIndex: 9999,
		}),
		menuList: (provided) => ({
			...provided,
			padding: '0.5rem 0',
		}),
		option: (provided, state) => ({
			...provided,
			backgroundColor: state.isSelected
				? '#009ef7'
				: state.isFocused
					? '#f1f3ff'
					: 'transparent',
			color: state.isSelected ? '#ffffff' : '#181c32',
			fontSize: '13px',
			fontWeight: '500',
			padding: '0.75rem 1rem',
			cursor: 'pointer',
			'&:hover': {
				backgroundColor: state.isSelected ? '#0084d1' : '#f1f3ff',
				color: state.isSelected ? '#ffffff' : '#181c32',
			},
		}),
		indicatorSeparator: () => ({
			display: 'none',
		}),
		dropdownIndicator: (provided, state) => ({
			...provided,
			color: '#a1a5b7',
			padding: '8px',
			'&:hover': {
				color: '#181c32',
			},
			transform: state.selectProps.menuIsOpen
				? 'rotate(180deg)'
				: 'rotate(0deg)',
			transition: 'transform 0.2s ease',
		}),
		clearIndicator: (provided) => ({
			...provided,
			color: '#a1a5b7',
			padding: '8px',
			'&:hover': {
				color: '#dc3545',
			},
		}),
		loadingIndicator: (provided) => ({
			...provided,
			color: '#009ef7',
		}),
	};

	return (
		<div className={`fv-row ${className}`}>
			{label && (
				<label
					className={`form-label fw-bolder text-dark fs-6 mb-2 ${required ? 'required' : ''}`}>
					{label}
				</label>
			)}
			<Select
				name={name}
				value={selectedOption}
				onChange={handleChange}
				onBlur={onBlur}
				options={options}
				styles={customStyles}
				placeholder={placeholder}
				isDisabled={disabled}
				isClearable={isClearable}
				isLoading={isLoading}
				isSearchable={isSearchable}
				noOptionsMessage={() => 'Нет доступных опций'}
				loadingMessage={() => 'Загрузка...'}
				className="react-select-container"
				classNamePrefix="react-select"
			/>
			{touched && errors && (
				<div className="fv-plugins-message-container">
					<div className="fv-help-block">
						<span role="alert">{errors}</span>
					</div>
				</div>
			)}
		</div>
	);
};

export { SDSelect };

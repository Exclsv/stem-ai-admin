import React from 'react';

interface SDCharCounterProps {
	current: number;
	max: number;
	className?: string;
}

/**
 * Компонент для отображения счетчика символов
 * @param current - текущее количество символов
 * @param max - максимально допустимое количество символов
 */
export const SDCharCounter: React.FC<SDCharCounterProps> = ({
	current,
	max,
	className = 'text-end',
}) => {
	const isNearLimit = current >= max * 0.9;
	const isOverLimit = current > max;

	return (
		<div
			className={`d-flex justify-content-end mt-1 fs-7 ${className} ${
				isOverLimit
					? 'text-danger'
					: isNearLimit
						? 'text-warning'
						: 'text-muted'
			}`}>
			{current}/{max}
		</div>
	);
};

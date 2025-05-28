import { FC, ReactNode } from 'react';
import { useIntl } from 'react-intl';

type SDTablePropsType = {
	children: ReactNode;
	onChageSelectedItems?: () => void;
	selectedItems?: number;
	data?: number;
	isLoading?: boolean;
	thead: {
		title: ReactNode;
		className?: string;
		isActive?: boolean;
	}[];
};

export const SDTable: FC<SDTablePropsType> = ({
	children,
	thead,
	data,
	selectedItems,
	isLoading = false,
	onChageSelectedItems,
}) => {
	const { formatMessage } = useIntl();
	return isLoading ? (
		<div className="position-relative min-h-300px">
			{isLoading && (
				<div
					className="position-absolute top-0 start-0 w-100 h-100 d-flex
          align-items-center justify-content-center bg-white"
					style={{ zIndex: 150 }}>
					<span className="loader"></span>{' '}
					<span className="ms-2">Loading...</span>
				</div>
			)}
		</div>
	) : (
		<div className="position-relative min-h-300px">
			<div className="table-responsive min-h-300px" style={{ zIndex: 100 }}>
				<table className="table sd-table border table-rounded table-row-dashed table-row-gray-300 gy-2 gs-1">
					<thead>
						<tr className="fw-bold bg-secondary">
							<th className="w-25px ps-3">
								<div className="form-check form-check-sm form-check-custom form-check-solid">
									<input
										className="form-check-input bg-white"
										type="checkbox"
										value="1"
										checked={
											data !== undefined &&
											selectedItems !== undefined &&
											data <= selectedItems
										}
										onChange={onChageSelectedItems}
									/>
								</div>
							</th>
							{thead.map((th, index) => (
								<th
									key={`table-th-${index}`}
									className={`${th.className}`}
									aria-disabled={th.isActive}>
									{th.title}
								</th>
							))}
						</tr>
					</thead>
					<tbody>{children}</tbody>
				</table>
			</div>{' '}
			{data === 0 && (
				<div className="d-flex flex-column flex-center card p-4 align-items-center position-absolute top-0 start-0 left-0 right-0 w-100 h-100 z-index-10">
					<i
						className="bi-x-circle-fill bg-body text-primary fs-1 m-0"
						style={{ fontSize: 20 }}></i>
					<p className="text-center text-muted fs-5 fw-bold m-0">
						{formatMessage({ id: 'COMMON.NO_DATA' })}
					</p>
				</div>
			)}
		</div>
	);
};

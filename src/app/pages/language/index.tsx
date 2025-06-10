import clsx from 'clsx';
import moment from 'moment';
import { useIntl } from 'react-intl';
import { FC, useEffect, useState } from 'react';
import { AddOrEditOffcanvas } from './components';
import { useSearchParams } from 'react-router-dom';
import { Content } from '../../../_metronic/layout/components/content';
import { useLanguages } from '../../hooks/language/useLanguagiesQuery.ts';
import {
	LanguageType,
	GenericObject,
	KTIcon,
	KTSVG,
	TableHeadType,
	ApiResponse,
} from '../../../_metronic/helpers';
import {
	SDButton,
	SDModalDelete,
	SDPagination,
	SDPaginationSize,
	SDTable,
	SDVisibleColumnTable,
} from '../../components';

export const LanguagePage: FC = () => {
	const intl = useIntl();
	const [searchParams, setSearchParams] = useSearchParams();

	const [choosenItem, setChoosenItem] = useState<LanguageType | null>(null);
	const [searchName, setSearchName] = useState<string>('');
	const [languages, setLanguages] = useState<LanguageType[]>([]);

	const [offCanvasShow, setOffCanvasShow] = useState<boolean>(false);
	const [visibleColumnTable, setVisibleColumnTable] = useState<boolean>(false);
	const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
	const [selectedItems, setSelectedItems] = useState<number[]>([]);

	// QUERY PARAMS
	const page = parseInt(searchParams.get('page') as string, 10) || 1;
	const page_size = parseInt(searchParams.get('page_size') as string, 10) || 20;
	const search = searchParams.get('search') || '';
	const [totalPageCount, setTotalPageCount] = useState(
		parseInt(searchParams.get('total_page_count') as string, 10) || 1
	);

	const buildQueryParams = () => {
		let query = `?page=${page}&page_size=${page_size}`;
		if (search) query += `&search=${search}`;

		return query;
	};

	const { data, isLoading, isError, error, refetch } =
		useLanguages(buildQueryParams());

	// Обновление данных при получении ответа API
	useEffect(() => {
		if (data) {
			setLanguages(data.data);
			// Обновляем информацию о пагинации
			if (data.pagination) {
				setTotalPageCount(data.pagination.last_page);
			}
		}
	}, [data]);

	// TABLE COMPONENT
	const [tableThead, setTableThead] = useState<TableHeadType[]>([
		{
			title: intl.formatMessage({ id: 'COMMON.ID' }),
			key: 'id',
			isActive: true,
			disabled: true,
			className: 'w-25px',
		},
		{
			title: intl.formatMessage({ id: 'COMMON.CODE' }),
			key: 'code',
			isActive: true,
			disabled: true,
		},
		{
			title: intl.formatMessage({ id: 'COMMON.NAME' }),
			key: 'name',
			isActive: true,
			disabled: true,
		},

		{
			title: intl.formatMessage({ id: 'COMMON.CREATED_AT' }),
			key: 'created_at',
			isActive: false,
			disabled: false,
		},
		{
			title: intl.formatMessage({ id: 'COMMON.UPDATED_AT' }),
			key: 'updated_at',
			isActive: false,
			disabled: false,
		},
		{
			title: intl.formatMessage({ id: 'COMMON.CREATED_BY' }),
			key: 'created_by',
			isActive: false,
			disabled: false,
		},
		{
			title: intl.formatMessage({ id: 'COMMON.UPDATED_BY' }),
			key: 'updated_by',
			isActive: false,
			disabled: false,
		},
		{
			title: '',
			key: 'actions',
			className: 'w-50px',
			disabled: true,
		},
	]);

	const renderTableRow = (
		value: LanguageType,
		selectedItems: number[],
		setSelectedItems: React.Dispatch<React.SetStateAction<number[]>>
	) => {
		const isSelected = selectedItems.includes(value.id);
		const handleCheckboxChange = (id: number) => {
			setSelectedItems((prevSelected) =>
				prevSelected.includes(id)
					? prevSelected.filter((itemId) => itemId !== id)
					: [...prevSelected, id]
			);
		};

		return (
			<tr
				key={`list-${value.id}`}
				className={clsx({
					'bg-danger-delete': value.is_delete,
					select_without_delete: isSelected && value.is_delete,
					select_with_delete: isSelected && !value.is_delete,
				})}
				onDoubleClick={(e) => {
					setChoosenItem(value);
					setOffCanvasShow(true);
					e.stopPropagation();
				}}>
				<th className="w-25px ps-3 align-middle ">
					<div className="form-check form-check-sm form-check-custom form-check-solid">
						<input
							className="form-check-input"
							type="checkbox"
							checked={isSelected}
							onChange={(e) => {
								handleCheckboxChange(value.id);
								e.stopPropagation();
							}}
						/>
					</div>
				</th>
				{tableThead.map(
					(column) =>
						column.isActive && (
							<td key={`${column.key}-${value.id}`} className="align-middle ">
								{renderColumnData(
									column.key,
									value[column.key as keyof LanguageType]
								)}
							</td>
						)
				)}
				<td className="d-flex justify-content-end align-middle">
					<SDButton
						onClick={() => {
							setChoosenItem(value);
							setOffCanvasShow(true);
						}}
						className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1">
						<KTIcon iconName="pencil" className="fs-3" />
					</SDButton>

					<SDButton
						onClick={() => {
							setChoosenItem(value);
							setShowDeleteModal(true);
						}}
						className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm">
						<KTIcon iconName="trash" className="fs-3" />
					</SDButton>
				</td>
			</tr>
		);
	};

	const renderColumnData = (
		key: string,
		value: LanguageType[keyof LanguageType]
	) => {
		switch (key) {
			case 'image_url':
				return value ? (
					<img
						src={value as string}
						alt="News"
						style={{ maxWidth: '100px', height: 'auto' }}
						className="img-fluid"
					/>
				) : null;
			case 'created_at':
			case 'updated_at':
				return moment(value as string).format('DD.MM.YYYY');

			default:
				return value;
		}
	};

	// OTHER
	const changeSelectedItems = (data: LanguageType[]) => {
		if (data.length <= selectedItems.length) {
			setSelectedItems([]);
			return;
		}
		setSelectedItems(data.map((item) => item.id as number));
	};

	const changeQueryParams = (param: GenericObject): void => {
		Object.entries(param).forEach(([name, value]) => {
			searchParams.set(name, `${value}`);
		});

		setSearchParams(searchParams);
	};

	useEffect(() => {
		if (search != '') {
			setSearchName(search);
		}
	}, []);

	return (
		<>
			<Content>
				<div className="h-100 d-flex flex-column flex-column-fluid">
					<div className="card card-stretch shadow flex-column-fluid">
						<div className="card-header border-0">
							<div className="d-flex align-items-center justify-content-center">
								<div className="d-flex align-items-center position-relative input-group-sm my-1 me-3">
									<input
										type="text"
										data-kt-user-table-filter="search"
										className="form-control form-control-solid w-200px"
										placeholder={intl.formatMessage({ id: 'COMMON.SEARCH' })}
										value={searchName}
										onChange={(e) => setSearchName(e.target.value)}
									/>
									{searchName.length > 0 && (
										<div
											className="btn btn-icon btn-sm position-absolute sd-search-close"
											onClick={() => {
												setSearchName('');
												changeQueryParams({
													search: '',
													page: 1,
												});
											}}>
											<KTSVG
												path="media/icons/duotune/arrows/arr061.svg"
												className="svg-icon svg-icon-2x text-danger svg-close-icon"
											/>
										</div>
									)}
								</div>
								<SDButton
									className="btn btn-primary btn-sm"
									onClick={() => {
										searchName !== '' &&
											changeQueryParams({
												search: searchName,
												page: 1,
											});
									}}>
									{intl.formatMessage({ id: 'COMMON.SEARCH' })}
								</SDButton>
							</div>
							<div className="card-toolbar">
								<div className="ms-2">
									<SDButton
										className="btn btn-sm btn-icon btn-active-color-primary"
										onClick={() => setVisibleColumnTable(true)}>
										<KTIcon iconName="gear" className="fs-3" iconType="solid" />
									</SDButton>
								</div>
								<SDButton
									className="btn btn-primary btn-sm ms-3"
									onClick={() => setOffCanvasShow(true)}>
									{intl.formatMessage({ id: 'COMMON.CREATE' })}
								</SDButton>
							</div>
						</div>
						<div className="card-body main-overflow-x pt-0">
							<SDTable
								isLoading={isLoading}
								thead={tableThead}
								data={languages?.length || 0}
								selectedItems={selectedItems.length}
								onChageSelectedItems={() =>
									changeSelectedItems(languages || [])
								}>
								{languages?.map((item) =>
									renderTableRow(item, selectedItems, setSelectedItems)
								)}
							</SDTable>
						</div>
						<div className="w-100 d-flex justify-content-between px-4 pb-5">
							<SDPaginationSize
								value={page_size}
								onChange={(e) =>
									changeQueryParams({
										page_size: e,
									})
								}
							/>
							<SDPagination
								items={totalPageCount}
								pageSize={page_size}
								onPageChange={(page) =>
									changeQueryParams({
										page: page,
									})
								}
								page={page}
							/>
						</div>
					</div>
				</div>
			</Content>

			<AddOrEditOffcanvas
				type={choosenItem ? 'edit' : 'add'}
				show={offCanvasShow}
				onHide={() => {
					setOffCanvasShow(false);
					setChoosenItem(null);
				}}
				choosenItem={choosenItem}
				refetch={refetch}
			/>

			<SDVisibleColumnTable
				show={visibleColumnTable}
				onHide={() => setVisibleColumnTable(false)}
				columns={tableThead}
				setTableThead={setTableThead}
			/>

			<SDModalDelete
				setOffCanvasShow={() => setOffCanvasShow(false)}
				show={showDeleteModal}
				onHide={() => setShowDeleteModal(false)}
				url={`/projects/${choosenItem?.id}`}
				refetch={refetch}
			/>
		</>
	);
};

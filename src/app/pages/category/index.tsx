import clsx from 'clsx';
import moment from 'moment';
import { useIntl } from 'react-intl';
import { FC, useEffect, useState, useCallback, Fragment } from 'react';
import { AddOrEditOffcanvas } from './components';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Content } from '../../../_metronic/layout/components/content';
import {
	CategoryType,
	GenericObject,
	KTIcon,
	KTSVG,
	TableHeadType,
	LanguageType,
} from '../../../_metronic/helpers';
import {
	SDButton,
	SDModalDelete,
	SDPagination,
	SDPaginationSize,
	SDTable,
	SDVisibleColumnTable,
} from '../../components';
import { useCategories } from '../../hooks/category/useCategoriesQuery.ts';
import { useLanguages } from '../../hooks/language/useLanguagiesQuery.ts';

export const CategoryPage: FC = () => {
	const intl = useIntl();
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();

	const [choosenItem, setChoosenItem] = useState<CategoryType | null>(null);
	const [searchName, setSearchName] = useState<string>('');
	const [expandedRows, setExpandedRows] = useState<number[]>([]);
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
	const [categories, setCategories] = useState<CategoryType[]>([]);

	const buildQueryParams = useCallback(() => {
		let query = `?page=${page}&page_size=${page_size}`;
		if (search) query += `&search=${search}`;

		return query;
	}, [page, page_size, search]);

	const { data, isLoading, isError, error, refetch } =
		useCategories(buildQueryParams());

	const { data: languagesData } = useLanguages('?page=1&page_size=10');

	// Обработка ошибок API
	useEffect(() => {
		if (isError && error) {
			console.error('API Error:', error);
		}
	}, [isError, error]);

	// Обработка данных языков
	useEffect(() => {
		if (languagesData) {
			setLanguages(languagesData.data);
		}
	}, [languagesData]);

	// Обновление данных и пагинации при получении ответа API
	useEffect(() => {
		if (data) {
			setCategories(data.data);
			// Обновляем информацию о пагинации
			if (data.pagination) {
				setTotalPageCount(data.pagination.last_page);
			}
		}
	}, [data]);

	// Обновление данных при изменении параметров запроса
	useEffect(() => {
		refetch();
	}, [page, page_size, search, refetch]);

	// TABLE COMPONENT
	const [tableThead, setTableThead] = useState<TableHeadType[]>([
		{
			title: intl.formatMessage({ id: 'COMMON.TITLE' }),
			key: 'title',
			isActive: true,
			disabled: true,
			className: 'w-250px',
		},
		{
			title: intl.formatMessage({ id: 'COMMON.DESCRIPTION' }),
			key: 'description',
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
		// {
		// 	title: intl.formatMessage({ id: 'COMMON.CREATED_BY' }),
		// 	key: 'created_by',
		// 	isActive: false,
		// 	disabled: false,
		// },
		// {
		// 	title: intl.formatMessage({ id: 'COMMON.UPDATED_BY' }),
		// 	key: 'updated_by',
		// 	isActive: false,
		// 	disabled: false,
		// },
		{
			title: '',
			key: 'actions',
			className: 'w-50px',
			disabled: true,
		},
	]);

	const renderTableRow = (
		value: CategoryType,
		selectedItems: number[],
		setSelectedItems: React.Dispatch<React.SetStateAction<number[]>>,
		allCategories: CategoryType[],
		isSubRow: boolean = false
	) => {
		const isSelected = selectedItems.includes(value.id);
		const handleCheckboxChange = (id: number) => {
			setSelectedItems((prevSelected) =>
				prevSelected.includes(id)
					? prevSelected.filter((itemId) => itemId !== id)
					: [...prevSelected, id]
			);
		};

		const hasSubcategories = allCategories.some(
			(cat) => cat.parent_category === value.id
		);
		const isExpanded = expandedRows.includes(value.id);

		const toggleRowExpansion = (e?: React.MouseEvent) => {
			e?.stopPropagation();

			setExpandedRows((prevExpanded) =>
				prevExpanded.includes(value.id)
					? prevExpanded.filter((rowId) => rowId !== value.id)
					: [...prevExpanded, value.id]
			);
		};

		const rowClass = clsx({
			'bg-danger-delete': value.is_delete,
			select_without_delete: isSelected && value.is_delete,
			select_with_delete: isSelected && !value.is_delete,
			'fw-bold': !isSubRow && hasSubcategories,
			'cursor-pointer': (!isSubRow && hasSubcategories) || isSubRow,
			'subcategory-item-row': isSubRow,
			'border-bottom-0': !isSubRow && isExpanded && hasSubcategories,
		});

		// Обработчик клика на строку для раскрытия подкатегорий или перехода к шагам
		const handleRowClick = () => {
			if (!isSubRow && hasSubcategories) {
				toggleRowExpansion();
			} else if (isSubRow) {
				// Если кликнули на подкатегорию, переходим на страницу шагов
				navigate(`/question-group/${value.id}`);
			}
		};

		return (
			<Fragment key={`list-fragment-${value.id}`}>
				<tr
					key={`list-${value.id}`}
					className={rowClass}
					onClick={handleRowClick}>
					<td className="w-25px ps-3 align-middle">
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
					</td>
					{tableThead.map(
						(column) =>
							column.isActive && (
								<td
									key={`${column.key}-${value.id}`}
									className={clsx('align-middle')}>
									{!isSubRow && column.key === 'title' && hasSubcategories && (
										<span
											className="cursor-pointer"
											onClick={(e) => {
												e.stopPropagation();
												toggleRowExpansion(e);
											}}>
											<KTIcon
												iconName={isExpanded ? 'minus-square' : 'plus-square'}
												className="fs-3 me-2 text-primary"
											/>
											{renderColumnData(column.key, value)}
										</span>
									)}
									{isSubRow && column.key === 'title' && (
										<span className="d-flex align-items-center">
											<KTIcon
												iconName="right-square"
												className="fs-3 me-2 text-info"
											/>
											{renderColumnData(column.key, value)}
										</span>
									)}
									{!isSubRow &&
										column.key === 'title' &&
										!hasSubcategories &&
										renderColumnData(column.key, value)}
									{column.key !== 'title' &&
										renderColumnData(column.key, value)}
								</td>
							)
					)}
					<td className="d-flex justify-content-end align-middle">
						<SDButton
							className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1"
							onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
								e.stopPropagation();
								setChoosenItem(value);
								setOffCanvasShow(true);
							}}>
							<KTIcon iconName="pencil" className="fs-3" />
						</SDButton>

						<SDButton
							className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
							onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
								e.stopPropagation();
								setChoosenItem(value);
								setShowDeleteModal(true);
							}}>
							<KTIcon iconName="trash" className="fs-3" />
						</SDButton>
					</td>
				</tr>

				{!isSubRow && isExpanded && hasSubcategories && (
					<tr
						key={`sub-table-container-${value.id}`}
						className="sub-table-row border-bottom">
						{/* Ячейка занимает все колонки основной таблицы */}
						<td
							colSpan={tableThead.filter((col) => col.isActive).length + 2}
							className="p-0">
							<div
								style={{
									padding: '10px 20px 10px 40px',
									backgroundColor: '#f9f9f9',
									width: '100%',
									boxSizing: 'border-box',
								}}>
								<table className="table table-sm table-hover nested-categories-table w-100">
									<thead className="border-bottom">
										<tr>
											{/* Пустая ячейка для чекбокса */}
											<th className="w-25px"></th>
											{tableThead
												.filter((col) => col.isActive)
												.map((column) => (
													<th key={`subcategory-header-${column.key}`}>
														{column.title}
													</th>
												))}
											{/* Пустая ячейка для кнопок действий */}
											<th className="w-50px"></th>
										</tr>
									</thead>
									<tbody>
										{allCategories
											.filter((cat) => cat.parent_category === value.id)
											.map((subCategory) =>
												renderTableRow(
													subCategory,
													selectedItems,
													setSelectedItems,
													allCategories,
													true // Помечаем, что это строка подкатегории
												)
											)}
									</tbody>
								</table>
							</div>
						</td>
					</tr>
				)}
			</Fragment>
		);
	};

	const renderColumnData = (
		key: string,
		item: CategoryType
	): React.ReactNode => {
		switch (key) {
			case 'title': {
				// Получаем первый перевод категории или возвращаем значение по умолчанию
				const translation =
					item.translations && item.translations.length > 0
						? item.translations[0]?.value
						: '-';
				return translation;
			}
			case 'description': {
				// Получаем первый промпт категории или возвращаем значение по умолчанию
				const prompt =
					item.prompts && item.prompts.length > 0
						? item.prompts[0]?.prompt
						: '-';
				return prompt;
			}
			case 'created_at':
			case 'updated_at':
				return item[key]
					? moment(item[key] as string).format('DD.MM.YYYY')
					: '-';

			case 'created_by':
			case 'updated_by':
				return item[key] || '-';

			case 'sub_categories':
				if (!item.parent_category) return '-';
				return item.parent_category || '-';

			default:
				return (item[key as keyof CategoryType] as string) || '-';
		}
	};

	// OTHER
	const changeSelectedItems = (data: CategoryType[]) => {
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

	// Обработчик закрытия модального окна удаления
	const handleCloseDeleteModal = () => {
		setShowDeleteModal(false);
		setChoosenItem(null);
	};

	useEffect(() => {
		if (search != '') {
			setSearchName(search);
		}
	}, [search]);

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
								data={categories?.length || 0}
								selectedItems={selectedItems.length}
								onChageSelectedItems={() =>
									changeSelectedItems(categories || [])
								}>
								{categories
									?.filter((item) => !item.parent_category) // Рендерим только родительские категории
									.map((item) =>
										renderTableRow(
											item,
											selectedItems,
											setSelectedItems,
											categories || []
										)
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
				languages={languages}
				setShowDeleteModal={() => setShowDeleteModal(true)}
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
				onHide={handleCloseDeleteModal}
				url={`/projects/${choosenItem?.id}`}
				refetch={refetch}
			/>
		</>
	);
};

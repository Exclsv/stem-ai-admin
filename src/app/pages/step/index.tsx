import clsx from 'clsx';
import moment from 'moment';
import { useIntl } from 'react-intl';
import { FC, useEffect, useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { Content } from '../../../_metronic/layout/components/content';
import {
	GenericObject,
	KTIcon,
	KTSVG,
	TableHeadType,
	LanguageType,
	ApiError,
	notifyError,
} from '../../../_metronic/helpers';
import {
	SDButton,
	SDModalDelete,
	SDPagination,
	SDPaginationSize,
	SDTable,
	SDVisibleColumnTable,
} from '../../components';
import { StepDrawer } from './components';
import { useStepsByProjectId } from '../../hooks/step';
import { useLanguages } from '../../hooks/language/useLanguagiesQuery.ts';
import { StepTypeResponse } from './types/stepTypes';
import { useDeleteStep } from '../../hooks/step/useDeleteStep';
import { toast } from 'react-toastify';

// Расширяем тип шага для добавления полей created_at и updated_at
type ExtendedStepType = {
	id: number;
	project: number;
	order: number;
	translations: {
		language_id: number;
		language_code: string;
		value: string;
	}[];
	created_at?: string;
	updated_at?: string;
};

export const StepPage: FC = () => {
	const intl = useIntl();
	const { projectId } = useParams<{ projectId: string }>();
	const [searchParams, setSearchParams] = useSearchParams();

	const [choosenItem, setChoosenItem] = useState<ExtendedStepType | null>(null);
	const [searchName, setSearchName] = useState<string>('');

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

	const { mutateAsync: deleteStep } = useDeleteStep();

	// Проверка projectId
	if (!projectId) {
		return <div>{intl.formatMessage({ id: 'COMMON.NO_PROJECT_ID' })}</div>;
	}

	const { data, isLoading, isError, error, refetch } = useStepsByProjectId(
		parseInt(projectId, 10)
	);
	const { data: languages } = useLanguages('?page=1&page_size=100');

	// Обработка ошибок API
	useEffect(() => {
		if (isError && error) {
			console.error('API Error:', error);
		}
	}, [isError, error]);

	// Обновление totalPageCount при получении данных
	useEffect(() => {
		if (data) {
			// В будущем можно будет рассчитать количество страниц
			// исходя из общего числа элементов
			setTotalPageCount(Math.ceil((data?.length || 0) / page_size));
		}
	}, [data, page_size]);

	// TABLE COMPONENT
	const [tableThead, setTableThead] = useState<TableHeadType[]>([
		{
			title: intl.formatMessage({ id: 'COMMON.ORDER' }),
			key: 'order',
			isActive: true,
			disabled: false,
			className: 'w-100px',
		},
		{
			title: intl.formatMessage({ id: 'COMMON.TITLE' }),
			key: 'title',
			isActive: true,
			disabled: true,
			className: 'w-250px',
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
			title: '',
			key: 'actions',
			className: 'w-50px',
			disabled: true,
		},
	]);

	const renderTableRow = (
		value: ExtendedStepType,
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
					select_without_delete: isSelected,
					select_with_delete: isSelected,
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
							<td key={`${column.key}-${value.id}`} className="align-middle">
								{renderColumnData(column.key, value, languages)}
							</td>
						)
				)}
				<td className="text-end align-middle">
					<SDButton
						className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm me-1"
						onClick={(e) => {
							e.stopPropagation();
							setChoosenItem(value);
							setOffCanvasShow(true);
						}}>
						<KTIcon iconName="pencil" className="fs-3" />
					</SDButton>

					<SDButton
						className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
						onClick={(e) => {
							e.stopPropagation();
							setChoosenItem(value);
							setShowDeleteModal(true);
						}}>
						<KTIcon iconName="trash" className="fs-3" />
					</SDButton>
				</td>
			</tr>
		);
	};

	const renderColumnData = (
		key: string,
		item: ExtendedStepType,
		languages?: LanguageType[]
	): React.ReactNode => {
		switch (key) {
			case 'title': {
				// Получаем первый перевод шага или возвращаем значение по умолчанию
				const translation =
					item.translations && item.translations.length > 0
						? item.translations[0]?.value
						: '-';
				return translation;
			}
			case 'created_at':
			case 'updated_at':
				return item[key as keyof ExtendedStepType]
					? moment(item[key as keyof ExtendedStepType] as string).format(
							'DD.MM.YYYY'
						)
					: '-';

			case 'order':
				return item.order || '-';

			default:
				return String(item[key as keyof ExtendedStepType] || '-');
		}
	};

	// OTHER
	const changeSelectedItems = (data: ExtendedStepType[]) => {
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

	// Обработчик удаления шага
	const handleDeleteStep = async () => {
		if (!choosenItem) return;

		try {
			await deleteStep(choosenItem.id);
			refetch();
			toast.success(
				intl.formatMessage({
					id: 'NOTIFICATION.STEP.DELETED',
				})
			);
		} catch (error) {
			console.error('Error deleting step:', error);
			const apiError = error as ApiError;
			notifyError(intl, apiError.response?.status || 500);
		} finally {
			handleCloseDeleteModal();
		}
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
								data={data?.length || 0}
								selectedItems={selectedItems.length}
								onChageSelectedItems={() => {
									if (data) {
										// Приводим данные к типу ExtendedStepType
										const extendedData = data.map((item: any) => ({
											...item,
											created_at: item.created_at || undefined,
											updated_at: item.updated_at || undefined,
										})) as ExtendedStepType[];
										changeSelectedItems(extendedData);
									}
								}}>
								{data?.map((item: any) => {
									// Приводим каждый элемент к типу ExtendedStepType
									const extendedItem = {
										...item,
										created_at: item.created_at || undefined,
										updated_at: item.updated_at || undefined,
									} as ExtendedStepType;
									return renderTableRow(
										extendedItem,
										selectedItems,
										setSelectedItems
									);
								})}
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

			<StepDrawer
				type={choosenItem ? 'edit' : 'add'}
				show={offCanvasShow}
				onHide={() => {
					setOffCanvasShow(false);
					setChoosenItem(null);
				}}
				choosenItem={choosenItem}
				refetch={refetch}
				languages={languages}
				projectId={parseInt(projectId, 10)}
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
				url={`/question-group/${choosenItem?.id}`}
				refetch={refetch}
			/>
		</>
	);
};

export default StepPage;

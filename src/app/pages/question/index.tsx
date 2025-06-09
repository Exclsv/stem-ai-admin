// Can be accessed via this path: "/question/:questionGroupId"

import clsx from 'clsx';
import { useIntl } from 'react-intl';
import { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QuestionDrawer } from './components';
import { Content } from '../../../_metronic/layout/components/content';
import {
	GenericObject,
	KTIcon,
	KTSVG,
	TableHeadType,
} from '../../../_metronic/helpers';
import {
	SDButton,
	SDModalDelete,
	SDTable,
	SDVisibleColumnTable,
} from '../../components';
import { useQuestionsByGroupId } from '../../hooks/question';
import { useLanguages } from '../../hooks/language/useLanguagiesQuery.ts';
import { QuestionType } from './types/questionTypes';

const QuestionPage: FC = () => {
	const intl = useIntl();
	const { questionGroupId } = useParams<{ questionGroupId: string }>();
	const groupId = parseInt(questionGroupId || '0', 10);

	const [groupData, setGroupData] = useState<any>(null);
	const [questions, setQuestions] = useState<QuestionType[]>([]);
	const [searchName, setSearchName] = useState<string>('');
	const [selectedItems, setSelectedItems] = useState<number[]>([]);
	const [choosenItem, setChoosenItem] = useState<QuestionType | null>(null);

	const [offCanvasShow, setOffCanvasShow] = useState<boolean>(false);
	const [visibleColumnTable, setVisibleColumnTable] = useState<boolean>(false);
	const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

	// Получаем данные о группе вопросов и вопросах
	const { data, isLoading, isError, error, refetch } =
		useQuestionsByGroupId(groupId);

	// Получаем список языков
	const { data: languages } = useLanguages('?page=1&page_size=100');

	// Обработка ошибок API
	useEffect(() => {
		if (isError && error) {
			console.error('API Error:', error);
		}
	}, [isError, error]);

	// Обновление данных при получении с сервера
	useEffect(() => {
		if (data) {
			setGroupData(data);
			if (data.questions) {
				setQuestions(data.questions);
			}
		}
	}, [data]);

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
			title: intl.formatMessage({ id: 'COMMON.TYPE' }),
			key: 'type',
			isActive: true,
			disabled: false,
		},
		{
			title: intl.formatMessage({ id: 'COMMON.ANSWERS' }),
			key: 'options',
			isActive: true,
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
		value: QuestionType,
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
			<tr key={`list-${value.id}`}>
				<td className="w-25px ps-3 align-middle">
					<div className="form-check form-check-sm form-check-custom form-check-solid">
						<input
							className="form-check-input"
							type="checkbox"
							checked={isSelected}
							onChange={() => handleCheckboxChange(value.id)}
						/>
					</div>
				</td>
				{tableThead.map(
					(column) =>
						column.isActive && (
							<td
								key={`${column.key}-${value.id}`}
								className={clsx('align-middle')}>
								{renderColumnData(column.key, value)}
							</td>
						)
				)}
				<td className="d-flex justify-content-end align-middle">
					<SDButton
						className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm me-1"
						onClick={() => {
							setChoosenItem(value);
							setOffCanvasShow(true);
						}}>
						<KTIcon iconName="pencil" className="fs-3" />
					</SDButton>

					<SDButton
						className="btn btn-icon btn-bg-light btn-active-color-danger btn-sm"
						onClick={() => {
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
		item: QuestionType
	): React.ReactNode => {
		switch (key) {
			case 'title': {
				// Получаем первый перевод вопроса или возвращаем значение по умолчанию
				const translation =
					item.translations && item.translations.length > 0
						? item.translations[0]?.value
						: '-';
				return translation;
			}
			case 'type': {
				// Отображаем тип вопроса
				switch (item.type) {
					case 'boolean':
						return intl.formatMessage({ id: 'QUESTION.TYPE.BOOLEAN' });
					case 'select':
						return intl.formatMessage({ id: 'QUESTION.TYPE.SELECT' });
					case 'free':
						return intl.formatMessage({ id: 'QUESTION.TYPE.FREE' });
					default:
						return item.type;
				}
			}
			case 'options': {
				// Показываем количество вариантов ответа
				if (item.type === 'free') {
					return intl.formatMessage({ id: 'QUESTION.NO_OPTIONS' });
				}
				return item.options ? `${item.options.length}` : '0';
			}
			default:
				return (item[key as keyof QuestionType] as string) || '-';
		}
	};

	// OTHER
	const changeSelectedItems = (data: QuestionType[]) => {
		if (data.length <= selectedItems.length) {
			setSelectedItems([]);
			return;
		}
		setSelectedItems(data.map((item) => item.id as number));
	};

	// Обработчик закрытия модального окна удаления
	const handleCloseDeleteModal = () => {
		setShowDeleteModal(false);
		setChoosenItem(null);
	};

	// Обработчик закрытия drawer
	const handleCloseDrawer = () => {
		setOffCanvasShow(false);
		setChoosenItem(null);
	};

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
										// Реализовать поиск по вопросам если необходимо
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
								data={questions?.length || 0}
								selectedItems={selectedItems.length}
								onChageSelectedItems={() =>
									changeSelectedItems(questions || [])
								}>
								{questions?.map((item) =>
									renderTableRow(item, selectedItems, setSelectedItems)
								)}
							</SDTable>
						</div>
					</div>
				</div>
			</Content>

			{offCanvasShow && (
				<QuestionDrawer
					type={choosenItem ? 'edit' : 'add'}
					show={offCanvasShow}
					onHide={handleCloseDrawer}
					choosenItem={choosenItem}
					refetch={refetch}
					languages={languages}
					groupId={groupId}
					setShowDeleteModal={() => setShowDeleteModal(true)}
				/>
			)}

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
				url={`/question/${choosenItem?.id}`}
				refetch={refetch}
			/>
		</>
	);
};

export default QuestionPage;

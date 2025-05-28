import { useIntl } from 'react-intl';
import { SDOffcanvas } from '../offcanvas';
import { Offcanvas } from 'react-bootstrap';
import { FC, useEffect, useState } from 'react';
import { KTSVG, TableHeadType } from '../../../_metronic/helpers';

interface SDVisibleColumnTableProps {
  show: boolean;
  onHide: () => void;
  columns: TableHeadType[];
  setTableThead: (obj: TableHeadType[]) => void;
}

export const SDVisibleColumnTable: FC<SDVisibleColumnTableProps> = ({
  show,
  onHide,
  columns,
  setTableThead,
}) => {
  const [areAllColumnsActive, setAreAllColumnsActive] = useState(false);
  const intl = useIntl();

  useEffect(() => {
    const allActive = columns.every((col) => col.isActive || col.disabled);
    setAreAllColumnsActive(allActive);
  }, [columns]);

  const handleToggleColumn = (key: string) => {
    const updatedThead = columns.map((col) =>
      col.key === key ? { ...col, isActive: !col.isActive } : col
    );
    setTableThead([...updatedThead]);
  };

  const handleToggleAll = () => {
    const toggleTo = !areAllColumnsActive;
    const updatedThead = columns.map((col) =>
      col.disabled ? col : { ...col, isActive: toggleTo }
    );
    setTableThead([...updatedThead]);
  };

  const sortedColumns = [...columns].sort((a, b) => {
    if (a.disabled === b.disabled) {
      return 0;
    }
    return a.disabled ? -1 : 1;
  });

  return (
    <SDOffcanvas
      show={show}
      onHide={onHide}
      width={'w-25'}
      footer={false}
      headerContent={
        <Offcanvas.Header className="d-flex justify-content-start">
          <Offcanvas.Title>
            {intl.formatMessage({ id: 'COMMON.VISIBLE_COLUMN_TABLE' })}
          </Offcanvas.Title>
          <div
            className="btn btn-icon btn-sm ms-2 position-absolute"
            style={{ left: -50, top: 10 }}
            onClick={onHide}
          >
            <KTSVG
              path="media/icon/duotune/arrows/arr061.svg"
              className="svg-icon svg-icon-2x text-white svg-close-icon"
            />
          </div>
        </Offcanvas.Header>
      }
    >
      <div className="row">
        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="toggle-all-columns"
            checked={areAllColumnsActive}
            onChange={handleToggleAll}
          />
          <label className="form-check-label ms-2" htmlFor="toggle-all-columns">
            {intl.formatMessage({ id: 'COMMON.SELECT_ALL' })}
          </label>
        </div>
        {sortedColumns?.map((column) => (
          <div
            className={`form-check mb-3 ${column.key == 'actions' && 'd-none'}`}
          >
            <input
              className="form-check-input"
              type="checkbox"
              id={`column-${column.key}`}
              checked={column.isActive}
              onChange={() => handleToggleColumn(column.key)}
              disabled={column.disabled}
            />
            <label
              className="form-check-label ms-2"
              htmlFor={`column-${column.key}`}
            >
              {column.title}
            </label>
          </div>
        ))}
      </div>
    </SDOffcanvas>
  );
};

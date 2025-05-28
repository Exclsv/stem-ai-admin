import React, { FC } from 'react';
import ReactPaginate from 'react-paginate';

interface SDPaginationProps {
  items: number; // Общее количество элементов
  page: number; // Текущая страница (управляется родителем)
  onPageChange: (selectedPage: number) => void; // Колбэк для изменения страницы
  paginationClassName?: string;
  activeClassName?: string;
  previousClassName?: string;
  nextClassName?: string;
  pageClassName?: string;
  pageLinkClassName?: string;
  breakClassName?: string;
  breakLinkClassName?: string;
  previousLabel?: React.ReactNode;
  nextLabel?: React.ReactNode;
  breakLabel?: React.ReactNode;
  pageSize: number;
}

export const SDPagination: FC<SDPaginationProps> = ({
  items = 0,
  page = 1, // Управляемая текущая страница
  pageSize = 20,
  onPageChange,
  paginationClassName = 'sd-pagination pagination justify-content-center',
  activeClassName = 'active bg-primary text-white',
  previousClassName = 'sd-page-item page-item cursor-pointer',
  nextClassName = 'sd-page-item page-item cursor-pointer',
  pageClassName = 'sd-page-item page-item cursor-pointer',
  pageLinkClassName = 'sd-page-link page-link cursor-pointer',
  breakClassName = 'sd-page-item page-item cursor-pointer',
  breakLinkClassName = 'sd-page-link page-link cursor-pointer',
  previousLabel = <i className="bi bi-arrow-left"></i>,
  nextLabel = <i className="bi bi-arrow-right"></i>,
  breakLabel = '...',
}) => {
  // Общее количество страниц
  const pageCount = Math.ceil(items / Number(pageSize));

  // Обработчик смены страницы
  const handlePageClick = (event: { selected: number }) => {
    onPageChange(event.selected + 1); // Передаем выбранную страницу наверх
  };

  return (
    <div>
      {/* Пагинация */}
      <ReactPaginate
        forcePage={page - 1} // Управляемая текущая страница
        previousLabel={previousLabel}
        nextLabel={nextLabel}
        breakLabel={breakLabel}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={3}
        onPageChange={handlePageClick}
        containerClassName={paginationClassName}
        pageClassName={pageClassName}
        pageLinkClassName={pageLinkClassName}
        previousClassName={previousClassName}
        previousLinkClassName={pageLinkClassName}
        nextClassName={nextClassName}
        nextLinkClassName={pageLinkClassName}
        breakClassName={`${breakClassName} disabled`}
        breakLinkClassName={`${breakLinkClassName} disabled`}
        activeClassName={activeClassName}
      />
    </div>
  );
};

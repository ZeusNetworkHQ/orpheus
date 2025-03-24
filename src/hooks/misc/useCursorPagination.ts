import { useState } from "react";

const useCursorPagination = (defaultItemsPerPage?: number) => {
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage ?? 20);
  const [pageCursorMap, setPageCursorMap] = useState<
    Record<number, string | null>
  >({
    1: null,
  });

  const handleNextPage = (cursor?: string | null) => () => {
    if (!cursor) return;

    if (currentCursor) {
      setPageCursorMap((prevPageCursorMap) => ({
        ...prevPageCursorMap,
        [currentPage]: currentCursor,
      }));
    }
    setCurrentCursor(cursor);
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage === 1) return;

    setCurrentCursor(pageCursorMap[currentPage - 1]);
    setCurrentPage((prevPage) => prevPage - 1);
  };

  const handleResetPage = () => {
    setCurrentPage(1);
    setCurrentCursor(null);
    setPageCursorMap({ 1: null });
  };

  const handleItemsPerPage = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    handleResetPage();
  };

  return {
    currentCursor,
    currentPage,
    itemsPerPage,
    handleNextPage,
    handlePrevPage,
    handleResetPage,
    handleItemsPerPage,
  };
};

export default useCursorPagination;

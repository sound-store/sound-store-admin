import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers: React.ReactNode[] = [];
    const maxPagesToShow = 5;

    // Logic to show ellipsis for large page sets
    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are fewer than maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(renderPageButton(i));
      }
    } else {
      // Always show first page
      pageNumbers.push(renderPageButton(1));

      // Calculate middle pages to show
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      // Add ellipsis if needed before middle pages
      if (startPage > 2) {
        pageNumbers.push(
          <span key="ellipsis-start" className="px-2">
            ...
          </span>
        );
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(renderPageButton(i));
      }

      // Add ellipsis if needed after middle pages
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <span key="ellipsis-end" className="px-2">
            ...
          </span>
        );
      }

      // Always show last page
      pageNumbers.push(renderPageButton(totalPages));
    }

    return pageNumbers;
  };

  const renderPageButton = (pageNumber: number) => {
    const isActive = pageNumber === currentPage;
    return (
      <Button
        key={pageNumber}
        variant={isActive ? "default" : "outline"}
        size="sm"
        className={`w-9 h-9 ${isActive ? "" : "hover:bg-muted"}`}
        onClick={() => onPageChange(pageNumber)}
      >
        {pageNumber}
      </Button>
    );
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrevious}
        disabled={currentPage <= 1}
        className="w-9 h-9 p-0"
      >
        <span className="sr-only">Go to previous page</span>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {renderPageNumbers()}
      <Button
        variant="outline"
        size="sm"
        onClick={handleNext}
        disabled={currentPage >= totalPages}
        className="w-9 h-9 p-0"
      >
        <span className="sr-only">Go to next page</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

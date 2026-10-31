// src/components/Pagination.tsx
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  darkMode: boolean;
}

const Pagination = ({ currentPage, totalPages, onPageChange, darkMode }: PaginationProps) => {
  return (
    <div className="flex justify-center mt-6">
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i + 1}
          onClick={() => onPageChange(i + 1)}
          className={`mx-1 px-4 py-2 rounded-lg ${
            currentPage === i + 1
              ? "bg-indigo-600 text-white"
              : darkMode
              ? "bg-gray-700 text-white"
              : "bg-gray-200 text-gray-700"
          } hover:bg-indigo-500 hover:text-white transition-all duration-300`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
};

export default Pagination;
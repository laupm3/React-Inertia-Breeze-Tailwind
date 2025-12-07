

const SearchBar = ({ onSearch }) => {
  return (
    <div className="flex items-center bg-gray-100 rounded-md px-3 py-2 w-full max-w-md">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-gray-500"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M12.9 14.32a8 8 0 111.414-1.414l3.84 3.84a1 1 0 01-1.415 1.414l-3.84-3.84zm-1.414-1.414a6 6 0 100-8.485 6 6 0 000 8.485z"
          clipRule="evenodd"
        />
      </svg>
      <input
        type="text"
        placeholder="Buscar archivos o carpetas"
        onChange={(e) => onSearch(e.target.value)}
        className="bg-transparent outline-none ml-3 text-sm text-gray-700 w-full"
      />
    </div>
  );
};

export default SearchBar;

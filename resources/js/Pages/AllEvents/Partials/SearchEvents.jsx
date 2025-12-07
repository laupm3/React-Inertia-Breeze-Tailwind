import Icon from "@/imports/LucideIcon";

const SearchEvents = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Icon name="Search" className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-full bg-gray-50 focus:ring-custom-orange focus:border-custom-orange dark:bg-custom-blackLight dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
        placeholder="Buscar eventos por nombre..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default SearchEvents;

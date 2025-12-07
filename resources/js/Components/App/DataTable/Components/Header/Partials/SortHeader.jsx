import { MoveDown, MoveUp } from "lucide-react";

export default function SortHeader({ column }) {

    const sortDirection = column.getIsSorted();
    return (
        column.getCanSort() && (
            <div className="flex items-center">
                <button
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex"
                    onClick={column.getToggleSortingHandler()}
                    title="Ordenar"
                >
                    <MoveUp size={16} className={`${sortDirection === 'asc' ? "text-orange-500" : ""}`}/>
                    <MoveDown size={16} className={`-ml-1.5 ${sortDirection === 'desc' ? "text-orange-500" : ""}`}/>
                </button>
            </div>
        )
    )
}
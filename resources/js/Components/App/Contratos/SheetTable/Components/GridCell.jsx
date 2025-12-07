export const GridCell = ({ label, value, className = '', isHeader = false, isLast = false }) => {
    const headerClass = "bg-custom-gray-default/50 dark:bg-custom-gray-darker/50 p-3 flex justify-between items-center";
    const contentClass = "bg-white dark:bg-custom-gray-sidebar p-3 flex items-center border border-custom-gray-default dark:border-custom-gray-darker/50";

    return (
        <>
            <div className={headerClass}>
                <span className="text-sm text-custom-gray-semiDark dark:text-gray-300 font-medium">{label}</span>
            </div>
            <div className={`${contentClass} ${className} ${isLast ? 'rounded-br-[20px]' : ''} ${isHeader ? 'rounded-tr-[20px]' : ''} ${!isHeader ? '-mt-[1px]' : ''}`}>
                <div className="text-sm text-custom-gray-semiDark dark:text-gray-200 break-words w-full">
                    {value || 'No disponible'}
                </div>
            </div>
        </>
    );
}; 
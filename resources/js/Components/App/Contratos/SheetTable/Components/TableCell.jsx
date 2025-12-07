export const TableCell = ({ label, value, isLast, isFirst }) => {
    const baseHeaderClass = "bg-custom-gray-default/50 dark:bg-custom-gray-darker/50 p-3";
    const baseContentClass = "bg-white dark:bg-custom-gray-sidebar p-3 border border-custom-gray-default dark:border-custom-gray-darker/50";
    
    return (
        <div className={`overflow-hidden ${isFirst ? 'rounded-t-[20px]' : ''} ${isLast ? 'rounded-b-[20px]' : ''}`}>
            <div className={baseHeaderClass}>
                <span className="text-sm text-custom-gray-semiDark dark:text-gray-300 font-medium">{label}</span>
            </div>
            <div className={`${baseContentClass} ${isLast ? 'rounded-b-[20px]' : ''} ${!isFirst ? '-mt-[1px]' : ''}`}>
                <div className="text-sm text-custom-gray-semiDark dark:text-gray-200 break-words">
                    {value || 'No disponible'}
                </div>
            </div>
        </div>
    );
}; 
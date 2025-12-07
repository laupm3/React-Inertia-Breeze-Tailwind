export const TableCell = ({ label, value, isLast, isFirst }) => {
    const baseHeaderClass = "bg-custom-gray-default/50 dark:bg-custom-gray-darker/50 p-3";
    const baseContentClass = "bg-white dark:bg-custom-gray-sidebar p-3 border-2 border-custom-gray-default dark:border-custom-gray-darker/50 -mt-[2px]";
    
    return (
        <div className={`overflow-hidden ${isFirst ? 'rounded-t-[20px]' : ''} ${isLast ? 'rounded-b-[20px]' : ''}`}>
            <div className={baseHeaderClass}>
                <span className="text-sm text-custom-gray-semiDark dark:text-gray-300 font-medium">{label}</span>
            </div>
            <div className={`${baseContentClass} ${isLast ? 'rounded-b-[20px]' : ''}`}>
                <span className="text-sm text-custom-gray-semiDark dark:text-gray-200">
                    {value || 'not Provided'}
                </span>
            </div>
        </div>
    );
}; 
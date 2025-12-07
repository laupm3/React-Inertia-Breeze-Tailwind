import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";

export function TableToolbar({ table, buttons, filterColumn, inputPlaceholder }) {
    return (
        <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
                {buttons.map((button, index) => (
                    <Button 
                        key={index} 
                        className={`${button.bgClass} ${button.borderClass} ${button.textClass}`} 
                        onClick={button.onClick}
                    >
                        {button.icon && <button.icon className="mr-2" />}
                        {button.text}
                    </Button>
                ))}
            </div>

            {/* Input de filtro */}
            {filterColumn && (
                <div className="w-1/3">
                    <Input 
                        type="text" 
                        placeholder={inputPlaceholder || `Filter by ${filterColumn}`} 
                        onChange={(e) => table.setColumnFilter(filterColumn, e.target.value)}
                    />
                </div>
            )}
        </div>
    );
}

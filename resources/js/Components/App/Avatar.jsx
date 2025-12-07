import { Avatar as AvatarBase, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip";

/**
 * Un componente de Avatar genérico y reutilizable con Tooltip.
 *
 * @param {{
 *  src?: string,
 *  alt?: string,
 *  fallback: string,
 *  tooltip: string,
 *  className?: string
 * }} props
 */
export default function Avatar({ src, alt = "Avatar", fallback, tooltip, className = '' }) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <AvatarBase className={`rounded-full ${className}`}>
                        {src ? (
                            <AvatarImage src={src} alt={alt} />
                        ) : (
                            <AvatarFallback className="flex h-full w-full items-center justify-center rounded-full bg-gray-200 text-sm font-medium dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                {fallback}
                            </AvatarFallback>
                        )}
                    </AvatarBase>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{tooltip}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

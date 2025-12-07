import { Avatar as AvatarBase, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip";

export default function EmpleadoAvatar({ empleado, className = '' }) {
    return (
        <div className={`flex items-center gap-2 max-w-[12rem] ${className}`}>
            <AvatarBase className="h-8 w-8 rounded-full">
                {empleado?.user?.profile_photo_url ? (
                    <AvatarImage
                        src={empleado?.user.profile_photo_url}
                        alt={empleado?.nombre || empleado?.name}
                    />
                ) : (
                    <AvatarFallback className="rounded-lg">
                        {empleado?.nombre[0] || empleado?.name[0]}
                    </AvatarFallback>
                )}
            </AvatarBase>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="text-nowrap text-ellipsis overflow-hidden">
                            {`${empleado?.primerApellido} ${empleado?.segundoApellido}, ${empleado?.nombre || empleado?.name}`}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{`${empleado?.primerApellido} ${empleado?.segundoApellido}, ${empleado?.nombre || empleado?.name}`}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}
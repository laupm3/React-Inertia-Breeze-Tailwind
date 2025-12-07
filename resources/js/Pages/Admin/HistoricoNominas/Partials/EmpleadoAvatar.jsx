import { Avatar as AvatarBase, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip";

export default function EmpleadoAvatar({ user }) {
    if (!user) {
        return <div className="text-gray-500">No asignado</div>;
    }

    const initials = user.name
        ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : 'S/N';

    return (
        <div className="flex items-center gap-2 max-w-[12rem]">
            <AvatarBase className="h-8 w-8 rounded-full -ml-2">
                {user.profile_photo_url ? (
                    <AvatarImage
                        src={user.profile_photo_url}
                        alt={user.name}
                    />
                ) : (
                    <AvatarFallback className="rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {initials}
                    </AvatarFallback>
                )}
            </AvatarBase>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="text-nowrap text-ellipsis overflow-hidden">
                            {user.name}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{user.name}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}
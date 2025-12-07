import { Avatar as AvatarBase, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip";

export default function UserAvatar({ user, className = '' }) {
    return (
        <div className={`flex items-center gap-2 max-w-[12rem] ${className}`}>
            <AvatarBase className="h-8 w-8 rounded-full">
                {user?.profile_photo_url ? (
                    <AvatarImage
                        src={user.profile_photo_url}
                        alt={user?.name}
                    />
                ) : (
                    <AvatarFallback className="rounded-lg">
                        {user?.name?.[0] || user?.email?.[0] || 'U'}
                    </AvatarFallback>
                )}
            </AvatarBase>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="text-nowrap text-ellipsis overflow-hidden">
                            {user?.name || user?.email || 'Usuario'}
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{user?.name || user?.email || 'Usuario'}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}

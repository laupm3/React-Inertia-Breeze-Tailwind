import { Avatar as AvatarBase, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/Components/ui/tooltip";

export default function UserAvatarGroup({ users = [], maxVisible = 3, placeholder = "Selecciona usuarios" }) {
    // Si no hay usuarios, mostrar placeholder
    if (!users || users.length === 0) {
        return <span className="text-gray-500 text-sm">{placeholder}</span>;
    }

    // Si hay un solo usuario, mostrar nombre completo
    if (users.length === 1) {
        const user = users[0];
        return (
            <div className="flex items-center gap-2">
                <AvatarBase className="h-6 w-6 rounded-full">
                    {user?.profile_photo_url ? (
                        <AvatarImage
                            src={user.profile_photo_url}
                            alt={user?.name}
                        />
                    ) : (
                        <AvatarFallback className="rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                            {user?.name?.[0] || user?.email?.[0] || 'U'}
                        </AvatarFallback>
                    )}
                </AvatarBase>
                <span className="text-sm text-custom-blackLight dark:text-custom-white truncate">
                    {user?.name || user?.email || 'Usuario'}
                </span>
            </div>
        );
    }

    // Para múltiples usuarios, mostrar avatares en grupo
    const visibleUsers = users.slice(0, maxVisible);
    const remainingCount = users.length - maxVisible;

    return (
        <div className="flex items-center gap-1">
            {/* Avatares de usuarios visibles */}
            <div className="flex -space-x-1">
                {visibleUsers.map((user, index) => (
                    <TooltipProvider key={user?.id || index}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <AvatarBase className="h-6 w-6 rounded-full border-2 border-white dark:border-custom-blackSemi relative z-10">
                                    {user?.profile_photo_url ? (
                                        <AvatarImage
                                            src={user.profile_photo_url}
                                            alt={user?.name}
                                        />
                                    ) : (
                                        <AvatarFallback className="rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                                            {user?.name?.[0] || user?.email?.[0] || 'U'}
                                        </AvatarFallback>
                                    )}
                                </AvatarBase>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white dark:bg-custom-blackSemi border border-gray-300 dark:border-gray-600 text-custom-blackLight dark:text-custom-white">
                                <p className="text-sm">{user?.name || user?.email || 'Usuario'}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </div>

            {/* Contador de usuarios adicionales */}
            {remainingCount > 0 && (
                <div className="flex items-center ml-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="h-6 px-2 rounded-full bg-custom-gray-dark dark:bg-custom-blackMedium text-custom-white text-xs flex items-center justify-center font-medium border border-gray-300 dark:border-gray-600">
                                    +{remainingCount}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white dark:bg-custom-blackSemi border border-gray-300 dark:border-gray-600 text-custom-blackLight dark:text-custom-white">
                                <div className="space-y-1 max-w-48">
                                    {users.slice(maxVisible).map((user, index) => (
                                        <p key={user?.id || index} className="text-xs truncate">
                                            {user?.name || user?.email || 'Usuario'}
                                        </p>
                                    ))}
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )}

        </div>
    );
}

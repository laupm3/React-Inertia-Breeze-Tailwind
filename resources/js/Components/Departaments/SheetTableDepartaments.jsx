import { SheetTable } from "@/Components/DataTable/SheetTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import React from "react";
import { Button } from "@/Components/ui/button";
import { Separator } from "@/Components/ui/separator";

export function SheetTableDepartaments({ departament, user, jetstream, isMobile }) {
    return (
        <SheetTable
        title={departament?.name ? departament.name : "departament Information"}
            triggerContent={
                <Button
                    variant="outline"
                    className="bg-custom-gray-default dark:bg-custom-blackLight border-custom-gray-dark dark:border-custom-gray-semiDark"
                >
                    Information
                </Button>
            }
            descriptionContent={
                <>
                    {/* Sección de Información del Centro */}
                    <div className="border-4 rounded-xl p-4 mb-6">
                        <h2 className="absolute top-24 bg-custom-white dark:bg-custom-blackLight text-custom-blue dark:text-custom-orange font-bold text-lg px-2">
                            Information
                        </h2>
                        <div className="text-custom-black dark:text-custom-white space-y-2">
                            <div>
                                <span className="font-medium">ID: </span>
                                <span>{departament?.id || "N/A"}</span>
                            </div>
                            <div>
                                <span className="font-medium">Responsable: </span>
                                <span>{departament?.Responsable || "Not provided"}</span>
                            </div>
                            <div>
                                <span className="font-medium">Description: </span>
                                <span>{departament?.Description || "Not provided"}</span>
                            </div>
                            <div>
                                <span className="font-medium">Asociate: </span>
                                <span>{departament?.Asociate || "Not specified"}</span>
                            </div>
                            <div>
                                <span className="font-medium">Created: </span>
                                <span>{departament?.Created || "Not specified"}</span>
                            </div>
                            <div>
                                <span className="font-medium">Upgrade: </span>
                                <span>{departament?.Upgrade || "Not provided"}</span>
                            </div>
                            
                        </div>
                    </div>

                    {/* Sección de usuarios */}
                    <div className="border-4 rounded-xl p-4">
                        <h2 className="absolute top-[23rem] bg-custom-white dark:bg-custom-blackLight text-custom-blue dark:text-custom-orange font-bold text-lg px-2">
                            Users
                        </h2>

                        <div className="flex flex-col gap-2 mt-4 text-custom-black dark:text-custom-white">
                            {/* Ejemplo de usuario en la lista de roles */}
                            <div className="flex items-center gap-2 px-1 py-1.5 text-sm">
                                <Avatar className="h-8 w-8 rounded-full">
                                    {jetstream?.managesProfilePhotos ? (
                                        <AvatarImage src={user?.profile_photo_url} alt={user?.name} />
                                    ) : (
                                        <AvatarFallback className="rounded-lg">E</AvatarFallback>
                                    )}
                                </Avatar>
                                <div className={`rounded-xl ${isMobile ? "text-right" : "text-left"} flex-1 text-sm leading-tight`}>
                                    <div className="flex flex-col">
                                        <span className="truncate font-semibold">
                                            {user?.name || "Eduardo"}
                                        </span>
                                        <span className="truncate text-xs">
                                            {user?.email || "Eduardo@gmail.com"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-1 py-1.5 text-sm">
                                <Avatar className="h-8 w-8 rounded-full">
                                    {jetstream?.managesProfilePhotos ? (
                                        <AvatarImage src={user?.profile_photo_url} alt={user?.name} />
                                    ) : (
                                        <AvatarFallback className="rounded-lg">E</AvatarFallback>
                                    )}
                                </Avatar>
                                <div className={`rounded-xl ${isMobile ? "text-right" : "text-left"} flex-1 text-sm leading-tight`}>
                                    <div className="flex flex-col">
                                        <span className="truncate font-semibold">
                                            {user?.name || "Eduardo"}
                                        </span>
                                        <span className="truncate text-xs">
                                            {user?.email || "Eduardo@gmail.com"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-1 py-1.5 text-sm">
                                <Avatar className="h-8 w-8 rounded-full">
                                    {jetstream?.managesProfilePhotos ? (
                                        <AvatarImage src={user?.profile_photo_url} alt={user?.name} />
                                    ) : (
                                        <AvatarFallback className="rounded-lg">E</AvatarFallback>
                                    )}
                                </Avatar>
                                <div className={`rounded-xl ${isMobile ? "text-right" : "text-left"} flex-1 text-sm leading-tight`}>
                                    <div className="flex flex-col">
                                        <span className="truncate font-semibold">
                                            {user?.name || "Eduardo"}
                                        </span>
                                        <span className="truncate text-xs">
                                            {user?.email || "Eduardo@gmail.com"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-1 py-1.5 text-sm">
                                <Avatar className="h-8 w-8 rounded-full">
                                    {jetstream?.managesProfilePhotos ? (
                                        <AvatarImage src={user?.profile_photo_url} alt={user?.name} />
                                    ) : (
                                        <AvatarFallback className="rounded-lg">E</AvatarFallback>
                                    )}
                                </Avatar>
                                <div className={`rounded-xl ${isMobile ? "text-right" : "text-left"} flex-1 text-sm leading-tight`}>
                                    <div className="flex flex-col">
                                        <span className="truncate font-semibold">
                                            {user?.name || "Eduardo"}
                                        </span>
                                        <span className="truncate text-xs">
                                            {user?.email || "Eduardo@gmail.com"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-1 py-1.5 text-sm">
                                <Avatar className="h-8 w-8 rounded-full">
                                    {jetstream?.managesProfilePhotos ? (
                                        <AvatarImage src={user?.profile_photo_url} alt={user?.name} />
                                    ) : (
                                        <AvatarFallback className="rounded-lg">E</AvatarFallback>
                                    )}
                                </Avatar>
                                <div className={`rounded-xl ${isMobile ? "text-right" : "text-left"} flex-1 text-sm leading-tight`}>
                                    <div className="flex flex-col">
                                        <span className="truncate font-semibold">
                                            {user?.name || "Eduardo"}
                                        </span>
                                        <span className="truncate text-xs">
                                            {user?.email || "Eduardo@gmail.com"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-1 py-1.5 text-sm">
                                <Avatar className="h-8 w-8 rounded-full">
                                    {jetstream?.managesProfilePhotos ? (
                                        <AvatarImage src={user?.profile_photo_url} alt={user?.name} />
                                    ) : (
                                        <AvatarFallback className="rounded-lg">E</AvatarFallback>
                                    )}
                                </Avatar>
                                <div className={`rounded-xl ${isMobile ? "text-right" : "text-left"} flex-1 text-sm leading-tight`}>
                                    <div className="flex flex-col">
                                        <span className="truncate font-semibold">
                                            {user?.name || "Eduardo"}
                                        </span>
                                        <span className="truncate text-xs">
                                            {user?.email || "Eduardo@gmail.com"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </>
            }
        />
    );
}

import { SheetTable } from "@/Components/DataTable/SheetTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import React from "react";
import { Button } from "@/Components/ui/button";
import { Separator } from "@/Components/ui/separator";

export function SheetTableCenters({ center, user, jetstream, isMobile }) {
    return (
        <SheetTable
        title={center?.name ? center.name : "Center Information"}
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
                                <span>{center?.id || "N/A"}</span>
                            </div>
                            <div>
                                <span className="font-medium">Company: </span>
                                <span>{center?.Company || "Not provided"}</span>
                            </div>
                            <div>
                                <span className="font-medium">Responsible: </span>
                                <span>{center?.responsible || "Not provided"}</span>
                            </div>
                            <div>
                                <span className="font-medium">Coordinator: </span>
                                <span>{center?.coordinator || "Not specified"}</span>
                            </div>
                            <div>
                                <span className="font-medium">Status: </span>
                                <span>{center?.status || "Not specified"}</span>
                            </div>
                            <div>
                                <span className="font-medium">Direction: </span>
                                <span>{center?.direction || "Not provided"}</span>
                            </div>
                            <div>
                                <span className="font-medium">Telephone: </span>
                                <span>{center?.telephone || "Not provided"}</span>
                            </div>
                            <div>
                                <span className="font-medium">Email: </span>
                                <span>{center?.Email || "Not provided"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Sección de Departamentos */}
                    <div className="border-4 rounded-xl p-4">
                        <h2 className="absolute top-[25.5rem] bg-custom-white dark:bg-custom-blackLight text-custom-blue dark:text-custom-orange font-bold text-lg px-2">
                            Departments
                        </h2>

                        {/* Contenedor de títulos de columnas */}
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-8 text-custom-black dark:text-custom-white font-semibold">
                            {/* Título de la columna Departaments */}
                            <div className="text-sm">Department</div>

                            {/* Título de la columna Number of Users */}
                            <div className="text-sm">Users</div>

                            {/* Título de la columna Manager */}
                            <div className="text-sm">Manager</div>
                        </div>

                        <Separator className="my-2" />

                        {/* Contenedor de datos */}
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 lg:gap-8 text-custom-black dark:text-custom-white">
                            {/* Departamento */}
                            <div className="text-sm">Design</div>
                           

                            {/* Número de Usuarios */}
                            <div className="text-sm">200</div>

                             {/* Manager */}
                             <div className="flex items-center gap-2 text-sm">
                                <Avatar className="h-8 w-8 rounded-full">
                                    {jetstream?.managesProfilePhotos ? (
                                        <AvatarImage src={user?.profile_photo_url} alt={user?.name} />
                                    ) : (
                                        <AvatarFallback className="rounded-lg">F</AvatarFallback>
                                    )}
                                </Avatar>
                                <div className={`rounded-xl ${isMobile ? "text-right" : "text-left"} flex-1 text-xs `}>
                                    <div className="flex flex-col">
                                        <span className="truncate font-semibold">
                                            {user?.name || "Felipe"}
                                        </span>
                                        <span className="truncate text-xs">
                                            {user?.email || "Felipe@gmail.com"}
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

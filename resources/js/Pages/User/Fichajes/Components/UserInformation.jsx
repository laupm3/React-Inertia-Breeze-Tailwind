import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import Icon from "@/imports/LucideIcon";
import { usePage } from "@inertiajs/react";
import { useFichajesSummary } from "../Hooks/useFichajesSummary";

export function UserInformation() {
    const user = usePage().props.auth.user;
    const jetstream = usePage().props.jetstream;
    const { jornadaEfectuada, jornadaTotal, balanceHoras } = useFichajesSummary();

    return (
        <div className="lg:flex gap-12 space-y-8 mb-8">
            {/* Information User Calendar: Name, Phone, Email, and Role */}
            <div className="m-2">
                <div className="flex items-center">
                    <div className="flex flex-col">
                        <Avatar className="h-20 w-20 rounded-full ml-2">
                            {jetstream.managesProfilePhotos ? (
                                <AvatarImage
                                    src={user.profile_photo_url}
                                    alt={user.name}
                                />
                            ) : (
                                <AvatarFallback className="rounded-lg">{user.name}</AvatarFallback>
                            )}
                        </Avatar>
                    </div>

                    <div className="ml-4 ">
                        <div className="flex flex-col ">
                            <div className="flex truncate text-lg font-semibold pt-2">
                                {user?.name || "Eduardo"}
                            </div>
                            <span className="flex truncate font-normal pt-2 text-sm">
                                {user?.role || "Responsable Dep.Tijeras"}
                            </span>
                            <span className="truncate text-xs flex pt-2 ">
                                <Icon name="Mail" size={16} className="mr-2 text-custom-orange" />
                                {user?.email || "Eduardo@gmail.com"}
                            </span>
                            <span className="truncate text-xs flex pt-2">
                                <Icon name="Phone" size={16} className="mr-2 text-custom-orange" />
                                {user?.phone || "646889475"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Iformation Journal */}
            <div className="flex flex-col md:flex-row w-full items-end justify-end space-y-4 md:space-y-0 md:space-x-4">
                <div className="rounded-lg p-2 bg-custom-gray-default dark:bg-custom-gray-darker w-full md:w-fit">
                    <h2 className="font-semibold mb-2 text-custom-orange">Jornada efectuada</h2>
                    <p className="text-sm">{jornadaEfectuada} horas</p>
                </div>

                <div className="rounded-lg p-2 bg-custom-gray-default dark:bg-custom-gray-darker w-full md:w-fit">
                    <h2 className="font-semibold mb-2 text-custom-orange">Jornada teórica</h2>
                    <p className="text-sm">{jornadaTotal} horas</p>
                </div>
                
                <div className="rounded-lg p-2 bg-custom-gray-default dark:bg-custom-gray-darker w-full md:w-fit">
                    <h2 className="font-semibold mb-2 text-custom-orange">Balance de horas</h2>
                    <p className="text-sm">{balanceHoras} horas</p>
                </div>

                <div className="rounded-lg p-2 bg-custom-gray-default dark:bg-custom-gray-darker w-full md:w-fit">
                    <h2 className="font-semibold mb-2 text-custom-orange">Vacaciones restantes</h2>
                    {/* //TODO: proveniente del back */}
                    <p className="text-sm">12/20 días</p>
                </div>
            </div>
        </div>
    );
}

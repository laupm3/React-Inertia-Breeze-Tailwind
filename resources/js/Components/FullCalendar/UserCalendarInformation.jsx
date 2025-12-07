import { useEffect, useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import Icon from "@/imports/LucideIcon";
import { Skeleton } from "@/Components/ui/skeleton";
import { usePage } from "@inertiajs/react";
import { differenceInMilliseconds } from "date-fns";

export function UserCalendarInfo({ horarios }) {
    const user = usePage().props.auth.user;
    const jetstream = usePage().props.jetstream;

    const [horasSemanales, setHorasSemanales] = useState({
        fichajeReal: "00:00",
        totalHoras: "00:00",
        balance: "00:00",
    });

    // Ref para asegurar que solo se ejecuta una vez al recibir los datos
    const hasCalculatedRef = useRef(false);

    useEffect(() => {
        if (!hasCalculatedRef.current && Array.isArray(horarios) && horarios.length > 0) {
            const resultado = calculateScheduleHours(horarios);
            setHorasSemanales(resultado);
            hasCalculatedRef.current = true; // Marca como ejecutado
        }
    }, [horarios]);

    const calculateScheduleHours = (horarios) => {
        const initialValue = {
            msFichajeTotal: 0,
            msTeoricoTotal: 0,
        };

        const msCalculados = horarios.reduce((acc, horario) => {
            const {
                horario_inicio,
                horario_fin,
                descanso_inicio,
                descanso_fin,
                fichaje_entrada,
                fichaje_salida,
                descansosAdicionales
            } = horario;

            const msDescanso = (descanso_inicio && descanso_fin)
                ? differenceInMilliseconds(descanso_fin, descanso_inicio)
                : 0;

            const msHorario = differenceInMilliseconds(horario_fin, horario_inicio);

            const msFichaje = (fichaje_entrada && fichaje_salida)
                ? differenceInMilliseconds(fichaje_salida, fichaje_entrada)
                : 0;

            const msDescansosAdicionales = (msFichaje && descansosAdicionales)
                ? descansosAdicionales.reduce((acc, descanso) =>
                    acc + differenceInMilliseconds(descanso.descanso_fin, descanso.descanso_inicio), 0)
                : 0;

            acc.msFichajeTotal += Math.max(0, msFichaje - msDescansosAdicionales);
            acc.msTeoricoTotal += Math.max(0, msHorario - msDescanso);

            return acc;
        }, initialValue);

        const balanceMs = msCalculados.msFichajeTotal - msCalculados.msTeoricoTotal;

        return {
            fichajeReal: msToTime(msCalculados.msFichajeTotal),
            totalHoras: msToTime(msCalculados.msTeoricoTotal),
            balance: msToTime(balanceMs),
        };
    };

    function msToTime(ms) {
        const sign = ms < 0 ? "-" : ms > 0 ? "+" : "";
        const absMs = Math.abs(ms);

        let minutes = parseInt((absMs / (1000 * 60)) % 60);
        let hours = Math.floor(absMs / (1000 * 60 * 60));

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;

        return `${sign}${hours}:${minutes}`;
    }

    return (
        <div className="lg:flex gap-12 space-y-8">
            <div className="m-2">
                <div className="flex items-center">
                    <Avatar className="h-20 w-20 rounded-full ml-2">
                        {jetstream.managesProfilePhotos ? (
                            <AvatarImage src={user.profile_photo_url} alt={user.name} />
                        ) : (
                            <AvatarFallback className="rounded-lg">{user.name}</AvatarFallback>
                        )}
                    </Avatar>

                    <div className="ml-4">
                        <div className="flex flex-col">
                            <div className="flex truncate text-lg font-semibold pt-2">
                                {user?.name || "N/A"}
                            </div>
                            <span className="truncate text-xs flex pt-2">
                                <Icon name="Mail" size={16} className="mr-2 text-custom-orange" />
                                {user?.email || "N/A"}
                            </span>
                            <span className="truncate text-xs flex pt-2">
                                <Icon name="Phone" size={16} className="mr-2 text-custom-orange" />
                                {user?.empleado?.telefono || "N/A"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Información de jornada */}
            <div className="flex flex-col md:flex-row w-full items-end justify-end space-y-4 md:space-y-0 md:space-x-4">
                {horasSemanales.fichajeReal !== "00:00" ? (
                    <div className="rounded-lg p-2 bg-custom-gray-default dark:bg-custom-gray-darker w-full md:w-fit">
                        <h2 className="font-semibold mb-2 text-custom-orange">Jornada semanal efectuada</h2>
                        <p className="text-sm">{`${horasSemanales.fichajeReal} horas`}</p>
                    </div>
                ) : (
                    <Skeleton className="h-full w-48" />
                )}


                {horasSemanales.totalHoras !== "00:00" ? (
                    <div className="rounded-lg p-2 bg-custom-gray-default dark:bg-custom-gray-darker w-full md:w-fit">
                        <h2 className="font-semibold mb-2 text-custom-orange">Jornada semanal total</h2>
                        <p className="text-sm">{`${horasSemanales.totalHoras} horas`}</p>
                    </div>
                ) : (
                    <Skeleton className="h-full w-40" />
                )}


                {horasSemanales.balance !== "00:00" ? (
                    <div className="rounded-lg p-2 bg-custom-gray-default dark:bg-custom-gray-darker w-full md:w-fit">
                        <h2 className="font-semibold mb-2 text-custom-orange">Balance de horas</h2>
                        <p className={`text-sm ${horasSemanales.balance.startsWith("-") ? 'text-muted-foreground' : 'text-green-500'}`}>

                            {`${horasSemanales.balance} horas`}
                        </p>
                    </div>
                ) : (
                    <Skeleton className="h-full w-36" />
                )}


                {/* //TODO: Aun no recibimos este dato */}
                {/* <div className="rounded-lg p-2 bg-custom-gray-default dark:bg-custom-gray-darker w-full md:w-fit">
                    <h2 className="font-semibold mb-2 text-custom-orange">Vacaciones restantes</h2>
                    <p className="text-sm">N/A</p>
                </div> */}
            </div>
        </div>
    );
}

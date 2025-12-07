import { Input } from "@/Components/ui/input";
import { Separator } from "@/Components/ui/separator";
import { Button } from "@/Components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Icon from '@/imports/LucideIcon';
import FetchSelect from "@/Components/App/FetchSelect/FetchSelect";
import { Popover, PopoverTrigger, PopoverContent } from "@/Components/ui/popover";
import { Calendar } from "@/Components/ui/calendar";
import JornadaDetail from './JornadaDetail';
import { useDialogData } from '../Context/DialogDataContext';
import AnexoActions from "./AnexoActions";

/**
 * Muestra y permite editar los datos del contrato original.
 */
export default function InformacionContrato({
    isEditing = false,
    onEdit,
    onAdd,
    onInfo,
}) {
    const { form } = useDialogData();
    const { data, errors } = form;

    return (
        <div className="flex flex-col gap-6 py-4 h-full">
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-custom-blue dark:text-custom-white">Datos del contrato</h3>
                    <AnexoActions
                        onEdit={onEdit}
                        onAdd={onAdd}
                        onInfo={onInfo}
                        canDelete={false} 
                    />
                </div>
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Nº Expediente<span className="text-custom-orange"> *</span></span>
                            <Input className="bg-custom-gray-default dark:bg-custom-gray-darker rounded-full" value={data.n_expediente ?? ''} disabled />
                            {errors.n_expediente && <span className="text-red-500 text-sm">{errors.n_expediente}</span>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Tipo de contrato<span className="text-custom-orange"> *</span></span>
                            <FetchSelect className="bg-custom-gray-default dark:bg-custom-gray-darker rounded-full" fetchRoute='api.v1.admin.contratos.types' responseParameter='tipos' value={data.tipo_contrato_id} disabled />
                            {errors.tipo_contrato_id && <span className="text-red-500 text-sm">{errors.tipo_contrato_id}</span>}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Departamento<span className="text-custom-orange"> *</span></span>
                            <FetchSelect className="bg-custom-gray-default dark:bg-custom-gray-darker rounded-full" fetchRoute='api.v1.admin.departamentos.index' responseParameter='departamentos' value={data.departamento_id} disabled />
                            {errors.departamento_id && <span className="text-red-500 text-sm">{errors.departamento_id}</span>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Asignación<span className="text-custom-orange"> *</span></span>
                            <FetchSelect className="bg-custom-gray-default dark:bg-custom-gray-darker rounded-full" fetchRoute='api.v1.admin.asignaciones.index' responseParameter='asignaciones' value={data.asignacion_id} disabled />
                            {errors.asignacion_id && <span className="text-red-500 text-sm">{errors.asignacion_id}</span>}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Fecha de inicio<span className="text-custom-orange"> *</span></span>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("flex justify-between items-center text-left font-normal bg-custom-gray-default dark:bg-custom-gray-darker rounded-full", !data.fecha_inicio && "text-muted-foreground")} disabled>
                                        <span>{data.fecha_inicio ? format(new Date(data.fecha_inicio), "dd/MM/yyyy") : 'Seleccionar fecha'}</span>
                                        <Icon name='Calendar' className="ml-2 h-4 w-4 text-custom-orange" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-custom-gray-default dark:bg-custom-blackSemi">
                                    <Calendar mode="single" selected={new Date(data.fecha_inicio ?? '')} initialFocus />
                                </PopoverContent>
                            </Popover>
                            {errors.fecha_inicio && <span className="text-red-500 text-sm">{errors.fecha_inicio}</span>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Fecha de fin</span>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("flex justify-between items-center text-left font-normal bg-custom-gray-default dark:bg-custom-gray-darker rounded-full", !data.fecha_fin && "text-muted-foreground")} disabled>
                                        <span>{data.fecha_fin ? format(new Date(data.fecha_fin), "dd/MM/yyyy") : '-- / -- / --'}</span>
                                        <Icon name='Calendar' className="ml-2 h-4 w-4 text-custom-orange" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-custom-gray-default dark:bg-custom-blackSemi">
                                    <Calendar mode="single" selected={new Date(data.fecha_fin ?? '')} initialFocus />
                                </PopoverContent>
                            </Popover>
                            {errors.fecha_fin && <span className="text-red-500 text-sm">{errors.fecha_fin}</span>}
                        </div>
                    </div>
                </div>
            </div>
            <Separator className="bg-custom-gray-semiLight dark:bg-custom-gray-semiDark" />
            <div>
                <h3 className="text-lg font-semibold text-custom-blue dark:text-custom-white mb-4">Vinculaciones</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Empresa<span className="text-custom-orange"> *</span></span>
                        <FetchSelect className="bg-custom-gray-default dark:bg-custom-gray-darker rounded-full" fetchRoute='api.v1.admin.empresas.index' responseParameter='empresas' value={data.empresa_id} disabled />
                        {errors.empresa_id && <span className="text-red-500 text-sm">{errors.empresa_id}</span>}
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Centro<span className="text-custom-orange"> *</span></span>
                        <FetchSelect className="bg-custom-gray-default dark:bg-custom-gray-darker rounded-full" fetchRoute='api.v1.admin.centros.index' responseParameter='centros' value={data.centro_id} disabled />
                        {errors.centro_id && <span className="text-red-500 text-sm">{errors.centro_id}</span>}
                    </div>
                </div>
            </div>
            
            <Separator className="bg-custom-gray-semiLight dark:bg-custom-gray-semiDark" />

            <div>
                <h3 className="text-lg font-semibold text-custom-blue dark:text-custom-white mb-4">Jornada</h3>
                <div className="overflow-x-auto">
                    <JornadaDetail jornadaId={data.jornada_id} />
                </div>
                {errors.jornada_id && <span className="text-red-500 text-sm">{errors.jornada_id}</span>}
            </div>
        </div>
    );
}
import { Input } from "@/Components/ui/input";
import { Separator } from "@/Components/ui/separator";
import { useDialogData } from '../Context/DialogDataContext';
import FetchSelect from "@/Components/App/FetchSelect/FetchSelect";
import JornadaDetail from './JornadaDetail';
import { DateTimePicker24h } from "@/Components/App/DateTimePicker/DateTimePicker";

/**
 * Componente de formulario para crear y editar anexos
 * 
 * Proporciona todos los campos necesarios para gestionar un anexo del contrato,
 * incluyendo información básica, fechas, departamento, asignación y jornada.
 * Incluye validación de errores y previsualización de la jornada seleccionada.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isEditing - Si está en modo edición (true) o creación (false)
 * @returns {JSX.Element} Formulario de anexo
 */
export default function FormularioAnexo({ isEditing }) {
    const { form, updateForm, selectedAnexo, contractData } = useDialogData();
    const { errors } = form;
    
    // Si no hay anexo seleccionado pero sí hay datos del contrato, mostrar el contrato base
    // Si no hay ninguno, no mostrar nada
    if (!selectedAnexo && !contractData) return null;
    
    // Usar selectedAnexo si existe, sino usar contractData
    const dataSource = selectedAnexo || contractData;
    const isContractBase = !selectedAnexo && contractData;

    // Helper para convertir string a Date object para el DateTimePicker
    const parseStringToDate = (dateString) => {
        if (!dateString) return null;
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? null : date;
        } catch (error) {
            return null;
        }
    };

    // Función helper para manejar cambios de fecha
    const handleDateChange = (field, date) => {
        // Solo permitir cambios si hay un anexo seleccionado (no en contrato base)
        if (selectedAnexo) {
            updateForm(field, date);
        }
    };

    // Asegurar que todos los campos tengan valores por defecto válidos
    // Para los IDs, asegurar que siempre sean strings para evitar controlled/uncontrolled issues
    const data = {
        n_expediente: dataSource.n_expediente || '',
        tipo_contrato_id: dataSource.tipo_contrato_id || '',
        departamento_id: dataSource.departamento_id || '',
        asignacion_id: dataSource.asignacion_id || '',
        fecha_inicio: parseStringToDate(dataSource.fecha_inicio),
        fecha_fin: parseStringToDate(dataSource.fecha_fin),
        jornada_id: dataSource.jornada_id || '',
    };
    
    // Si es contrato base, deshabilitar todos los campos
    const fieldsDisabled = isContractBase || isEditing;

    return (
        <div className="flex flex-col gap-4">
            {isContractBase && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        📄 Esta es la información del contrato base. Para crear modificaciones, añade un anexo.
                    </p>
                </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                    <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Nº Expediente<span className="text-custom-orange"> *</span></span>
                    <Input disabled placeholder='1232343' className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi" value={data.n_expediente} />
                    {errors.n_expediente && <span className="text-red-500 text-sm">{errors.n_expediente}</span>}
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Tipo de contrato<span className="text-custom-orange"> *</span></span>
                    <FetchSelect disabled fetchRoute='api.v1.admin.contratos.types' responseParameter='tipos' value={data.tipo_contrato_id} />
                    {errors.tipo_contrato_id && <span className="text-red-500 text-sm">{errors.tipo_contrato_id}</span>}
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                    <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Departamento<span className="text-custom-orange"> *</span></span>
                    <FetchSelect disabled fetchRoute='api.v1.admin.departamentos.index' responseParameter='departamentos' value={data.departamento_id} />
                    {errors.departamento_id && <span className="text-red-500 text-sm">{errors.departamento_id}</span>}
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Asignación<span className="text-custom-orange"> *</span></span>
                    <FetchSelect disabled fetchRoute='api.v1.admin.asignaciones.index' responseParameter='asignaciones' value={data.asignacion_id} />
                    {errors.asignacion_id && <span className="text-red-500 text-sm">{errors.asignacion_id}</span>}
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                    <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Fecha de inicio<span className="text-custom-orange"> *</span></span>
                    <DateTimePicker24h
                        disabled={fieldsDisabled}
                        value={data.fecha_inicio}
                        onChange={(value) => handleDateChange('fecha_inicio', value)}
                        placeholder="Seleccionar fecha"
                        format="PP, HH:mm"
                        modal={true}
                    />
                    {errors.fecha_inicio && <span className="text-red-500 text-sm">{errors.fecha_inicio}</span>}
                    {!data.fecha_inicio && !isContractBase && (
                        <span className="text-orange-500 text-sm">⚠️ Este campo es obligatorio para crear el anexo</span>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Fecha de fin</span>
                    <DateTimePicker24h
                        disabled={fieldsDisabled}
                        value={data.fecha_fin}
                        onChange={(value) => handleDateChange('fecha_fin', value)}
                        placeholder="Seleccionar fecha"
                        format="PP, HH:mm"
                        modal={true}
                    />
                    {errors.fecha_fin && <span className="text-red-500 text-sm">{errors.fecha_fin}</span>}
                </div>
            </div>
            <Separator className="bg-custom-gray-semiLight dark:bg-custom-gray-semiDark" />
            <h1 className="font-bold text-custom-blue dark:text-custom-white">Jornada</h1>

            <div className="flex flex-col gap-2">
                <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Seleccionar Jornada</span>
                <FetchSelect
                    disabled={fieldsDisabled}
                    fetchRoute='api.v1.admin.jornadas.index'
                    responseParameter='jornadas'
                    value={data.jornada_id}
                    onValueChange={(value) => selectedAnexo && updateForm('jornada_id', value || '')}
                    placeholder="Selecciona una jornada..."
                />
                {errors.jornada_id && <span className="text-red-500 text-sm">{errors.jornada_id}</span>}
            </div>

            {data.jornada_id && (
                <div className="mt-4 overflow-x-auto">
                    <JornadaDetail jornadaId={data.jornada_id} />
                </div>
            )}
        </div>
    );
} 
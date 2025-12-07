import { Input } from "@/Components/ui/input";
import { Separator } from "@/Components/ui/separator";
import { useDialogData } from '../Context/DialogDataContext';
import { useCallback, useEffect, useState } from "react";
import useDebounce from "@/Components/App/Hooks/useDebounce";
import FetchSelect from "@/Components/App/FetchSelect/FetchSelect";
import EmpleadoAdvanceDropdown from "@/Components/App/Empleado/AdvanceDropdown/AdvanceDropdown";
import JornadaAdvanceDropdown from "@/Components/App/Jornada/AdvanceDropdown/AdvanceDropdown";
import { DateTimePicker } from "@/Components/App/DateTimePicker/DateTimePicker";
import { format } from "date-fns";

/**
 * Función para formatear fechas en formato YYYY-MM-DD HH:mm:ss
 * @param {Date|undefined} date - Fecha a formatear
 * @returns {string|null} Fecha formateada o null si no hay fecha
 */
const formatDate = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return null;
  return format(date, 'yyyy-MM-dd HH:mm:ss');
};

/**
 * Componente que renderiza los campos del formulario para crear/editar un registro.
 * 
 * Gestiona la entrada de datos del usuario, la validación de campos
 * y la presentación de errores de validación específicos para cada campo.
 *
 * @returns {JSX.Element} Campos del formulario con sus etiquetas y mensajes de error
 */
export default function FormFields({ }) {
  const {
    form,
    updateForm,
  } = useDialogData();
  const { data, errors } = form;

  // Estado local para los inputs
  const [localData, setLocalData] = useState(data);

  // Crear función debounced para actualizar el formulario real
  const debouncedUpdateForm = useDebounce(updateForm, 500);

  // Sincronizar el estado local cuando cambia data
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  // Función para manejar cambios en inputs con actualización inmediata de UI
  const handleChange = useCallback((key, value) => {
    // Actualizar inmediatamente el estado local para mejor UX
    if (typeof key === 'object') {
      setLocalData(prev => ({
        ...prev,
        ...key
      }));
    } else {
      setLocalData(prev => ({
        ...prev,
        [key]: value
      }));
    }

    // Eliminar el error correspondiente si existe
    if (errors[key]) {
      delete errors[key];
    }

    // Actualizar el formulario real con debounce
    debouncedUpdateForm(key, value);
  }, [debouncedUpdateForm]);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="flex flex-col gap-2 ">
          <span className="text-sm font-bold  text-custom-blue dark:text-custom-white">Número de expediente<span className="text-custom-orange"> *</span></span>
          <Input
            placeholder='añadir número de expediente'
            className=" rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
            value={localData.n_expediente ?? ''}
            onChange={(e) => handleChange('n_expediente', e.target.value)}
          />
          <span className="text-xs text-custom-gray-semiDark dark:text-custom-gray-dark pl-1">Repetir registro</span>
          {errors.n_expediente && <span className="text-red-500 text-sm">{errors.n_expediente}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Tipo de contrato<span className="text-custom-orange"> *</span></span>
          <FetchSelect
            fetchRoute='api.v1.admin.contratos.types'
            responseParameter='tipos'
            value={localData.tipo_contrato_id}
            onValueChange={(value) => handleChange('tipo_contrato_id', Number(value))}
            disabled={false}
          />
          {errors.tipo_contrato_id && <span className="text-red-500 text-sm">{errors.tipo_contrato_id}</span>}
        </div>
        <div className="flex flex-col gap-2 ">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Asignación<span className="text-custom-orange"> *</span></span>
          <FetchSelect
            fetchRoute='api.v1.admin.asignaciones.index'
            responseParameter='asignaciones'
            value={localData.asignacion_id}
            onValueChange={(value) => handleChange('asignacion_id', Number(value))}
            disabled={false}
          />
          {errors.asignacion_id && <span className="text-red-500 text-sm">{errors.asignacion_id}</span>}
        </div>


      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Fecha de inicio<span className="text-custom-orange"> *</span></span>
          <DateTimePicker
            className="rounded-full"
            value={localData.fecha_inicio ? new Date(localData.fecha_inicio) : undefined}
            onChange={(date) => {
              const formattedDate = formatDate(date);
              handleChange('fecha_inicio', formattedDate);
            }}
            placeholder="Seleccionar fecha de inicio"
          />

          {errors.fecha_inicio && <span className="text-red-500 text-sm">{errors.fecha_inicio}</span>}
        </div>
        <div className="flex flex-col gap-2 ">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Fecha de fin</span>
          <DateTimePicker
            className="rounded-full"
            value={localData.fecha_fin ? new Date(localData.fecha_fin) : undefined}
            onChange={(date) => {
              const formattedDate = formatDate(date);
              handleChange('fecha_fin', formattedDate);
            }}
            placeholder="Seleccionar fecha de fin"
          />
          {errors.fecha_fin && <span className="text-red-500 text-sm">{errors.fecha_fin}</span>}
        </div>
      </div>

      <Separator className="bg-custom-blackSemi dark:bg-custom-white" />
      <h1 className=" font-bold text-custom-blue dark:text-custom-white">Vinculación</h1>
      {/* Row 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Empresa<span className="text-custom-orange"> *</span></span>
          <FetchSelect
            fetchRoute='api.v1.admin.empresas.index'
            responseParameter='empresas'
            value={localData.empresa_id}
            onValueChange={(value) => handleChange('empresa_id', Number(value))}
            disabled={false}
          />
          {errors.empresa_id && <span className="text-red-500 text-sm">{errors.empresa_id}</span>}
        </div>
        <div className="flex flex-col gap-2 ">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Centro<span className="text-custom-orange"> *</span></span>
          <FetchSelect
            fetchRoute='api.v1.admin.centros.index'
            responseParameter='centros'
            value={localData.centro_id}
            onValueChange={(value) => handleChange('centro_id', Number(value))}
            disabled={false}
          />
          {errors.centro_id && <span className="text-red-500 text-sm">{errors.centro_id}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Departamento<span className="text-custom-orange"> *</span></span>
          <FetchSelect
            fetchRoute='api.v1.admin.departamentos.index'
            responseParameter='departamentos'
            value={localData.departamento_id}
            onValueChange={(value) => handleChange('departamento_id', Number(value))}
            disabled={false}
          />
          {errors.departamento_id && <span className="text-red-500 text-sm">{errors.departamento_id}</span>}
        </div>
      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="flex flex-col gap-2 ">
          <span className="text-sm font-bold  text-custom-blue dark:text-custom-white"> Vinculación de empleado<span className="text-custom-orange"> *</span></span>
          <EmpleadoAdvanceDropdown
            defaultValue={localData.empleado_id}
            onChangeValue={(value) => handleChange('empleado_id', value)}
            enableCreateUpdateView={true}
            enableSheetTableView={true}
          />
          {errors.empleado_id && <span className="text-red-500 text-sm">{errors.empleado_id}</span>}
        </div>
        <div className="flex flex-col gap-2 ">
          <span className="text-sm font-bold  text-custom-blue dark:text-custom-white">
            Jornada<span className="text-custom-orange"> *</span>
          </span>
          <JornadaAdvanceDropdown
            defaultValue={localData.jornada_id}
            onChangeValue={(value) => handleChange('jornada_id', Number(value))}
            enableCreateUpdateView={true}
            enableSheetTableView={true}
          />
          {errors.jornada_id && <span className="text-red-500 text-sm">{errors.jornada_id}</span>}
        </div>
      </div>
    </div>
  )
}
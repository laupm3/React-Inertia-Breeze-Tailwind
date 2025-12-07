import { Input } from "@/Components/ui/input";
import { Separator } from "@/Components/ui/separator";
import { Button } from "@/Components/ui/button";
import { cn } from "@/lib/utils"
import { Calendar } from "@/Components/ui/calendar"
import { format } from "date-fns"
import Icon from '@/imports/LucideIcon'
import { useDialogData } from '../Context/DialogDataContext';
import { useCallback, useEffect, useState } from "react";
import useDebounce from "@/Components/App/Hooks/useDebounce";
import FetchSelect from "@/Components/App/FetchSelect/FetchSelect";
import { Popover, PopoverContent, PopoverTrigger, } from "@/Components/ui/popover"
import EmpleadoAdvanceDropdown from "@/Components/App/Empleado/AdvanceDropdown/AdvanceDropdown";

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
    <div className="flex flex-col gap-4">
      {/* Row 1 */}
      <div className="">
        <div className="flex flex-col gap-2 ">
          <span className="text-sm font-bold  text-custom-blue dark:text-custom-white">Nombre del departamento<span className="text-custom-orange"> *</span></span>
          <Input
            placeholder='Añadir departamento'
            className=" rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
            value={localData.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
          />
          {errors.nombre && <span className="text-xs text-red-500">{errors.nombre}</span>}
          <span className="text-xs text-custom-gray-semiDark dark:text-custom-gray-dark pl-1">Repetir Registro</span>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="flex flex-col gap-2 ">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Mánager<span className="text-custom-orange"> *</span></span>
          <EmpleadoAdvanceDropdown
            defaultValue={localData.manager_id}
            onChangeValue={(value) => handleChange('manager_id', value)}
            enableCreateUpdateView={true}
            enableSheetTableView={true}
          />
          {errors.manager_id && <span className="text-xs text-red-500">{errors.manager_id}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Adjunto<span className="text-custom-orange"> *</span></span>
          <EmpleadoAdvanceDropdown
            defaultValue={localData.adjunto_id}
            onChangeValue={(value) => handleChange('adjunto_id', value)}
            enableCreateUpdateView={true}
            enableSheetTableView={true}
          />
          {errors.adjunto_id && <span className="text-xs text-red-500">{errors.adjunto_id}</span>}
        </div>
      </div>

      {/* Row 3 */}
      <div className="">
        <div className="flex flex-col gap-2 ">
          <span className="text-sm font-bold  text-custom-blue dark:text-custom-white">Descripción</span>
          <Input
            placeholder="Lorem ipsum dolor..."
            className=" rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
            value={localData.descripcion}
            onChange={(e) => handleChange('descripcion', e.target.value)}
          />
          {errors.descripcion && <span className="text-xs text-red-500">{errors.descripcion}</span>}
        </div>
      </div>

      <Separator className="bg-custom-blackSemi dark:bg-custom-white" />
      <h1 className=" font-bold text-custom-blue dark:text-custom-white">Información de contacto</h1>

      {/* Row 4 */}
      <div className="grid grid-cols-1 gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Departamento</span>
          <FetchSelect
            fetchRoute='api.v1.admin.departamentos.index'
            responseParameter='departamentos'
            value={localData.parent_department_id}
            onValueChange={(value) => handleChange('parent_department_id', Number(value))}
            disabled={false}
          />
          {errors.parent_department_id && <span className="text-xs text-red-500">{errors.parent_department_id}</span>}
        </div>
      </div>
    </div>
  )
}
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
      {/* Row */}
      <div className="flex flex-col gap-8">
        <div className='flex w-full items-center gap-8'>
          <div className="flex w-full flex-col gap-2">
            <span className=" font-bold text-custom-blue dark:text-custom-orange">Nombre<span className="text-custom-orange">*</span></span>
            <Input
              placeholder='Añadir Nombre'
              className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-gray-darker"
              value={localData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
          </div>
          <div className="flex w-full flex-col gap-2">
            <span className=" font-bold text-custom-blue dark:text-custom-orange">Módulo<span className="text-custom-orange">*</span></span>
            <FetchSelect
              fetchRoute='api.v1.admin.modules.index'
              responseParameter='modules'
              value={parseInt(localData.module_id, 10)}
              onValueChange={(value) => handleChange('module_id', parseInt(value, 10))}
              disabled={false}
            />
            {errors.module_id && <span className="text-red-500 text-sm">{errors.module_id}</span>}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className=" font-bold text-custom-blue dark:text-custom-orange">Descripción<span className="text-custom-orange">*</span></span>
          <Input
            placeholder='Añadir Descripción'
            className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-gray-darker"
            value={localData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
          {errors.description && <span className="text-red-500 text-sm">{errors.description}</span>}
        </div>
      </div>
    </div>
  )
}
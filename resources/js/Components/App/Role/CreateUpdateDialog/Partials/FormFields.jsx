import { Input } from "@/Components/ui/input";
import { Separator } from "@/Components/ui/separator";
import { useDialogData } from '../Context/DialogDataContext';
import { useCallback, useEffect, useState } from "react";
import useDebounce from "@/Components/App/Hooks/useDebounce";
import FetchSelect from "@/Components/App/FetchSelect/FetchSelect";
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
        <div className="flex flex-col gap-2">
          <span className=" font-bold">Nombre<span className="text-custom-orange">*</span></span>
          <Input
            placeholder='Añadir nombre'
            className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-gray-darker"
            value={localData.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
          {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
        </div>
        <div className="flex flex-col gap-2 ">
          <span className=" font-bold">Descripción</span>
          <Input
            placeholder='Añadir descripción'
            className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-gray-darker"
            value={localData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />
          <p className="text-xs font-bold ml-auto text-custom-gray-dark dark:text-custom-gray-darker">Máximo 255 caracteres</p>
          {errors.description && <span className="text-red-500 text-sm">{errors.description}</span>}
        </div>
      </div>
    </div>
  )
}
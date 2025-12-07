import { Input } from "@/Components/ui/input";
import { Separator } from "@/Components/ui/separator";
import GoogleAddress from "@/Components/App/Direccion/GoogleAddress";
import { useDialogData } from '../Context/DialogDataContext';
import { useCallback, useEffect, useState } from "react";
import useDebounce from "@/Components/App/Hooks/useDebounce";
import FetchSelect from "@/Components/App/FetchSelect/FetchSelect";
import EmpleadoAdvanceDropdown from "@/Components/App/Empleado/AdvanceDropdown/AdvanceDropdown";
import { useTranslation } from "react-i18next";
import AdvanceDropdown from "@/Components/App/Empresa/AdvanceDropdown/AdvanceDropdown";
import { Textarea } from "@/Components/ui/textarea";

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
  const { t } = useTranslation('datatable');

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
      <div className="flex flex-col gap-2">
        <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
          Nombre <span className="text-custom-orange">*</span>
        </span>
        <Input
          placeholder={t('tables.nombreasignacion')}
          className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
          value={localData.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
        />
        {errors.nombre && <span className="text-xs text-red-500">{errors.nombre}</span>}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
          Descripción <span className="text-custom-orange">*</span>
        </span>
        <Textarea
          placeholder={t('tables.descripcionasignacion')}
          className="rounded-xl dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi min-h-[100px]"
          value={localData.descripcion}
          onChange={(e) => handleChange('descripcion', e.target.value)}
        />
        {errors.descripcion && <span className="text-xs text-red-500">{errors.descripcion}</span>}
      </div>
    </div>
  )
}
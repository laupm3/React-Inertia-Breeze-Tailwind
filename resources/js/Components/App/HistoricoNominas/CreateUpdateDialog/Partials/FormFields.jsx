import { Input } from "@/Components/ui/input";
import { useDialogData } from '../Context/DialogDataContext';
import { useCallback, useEffect, useState } from "react";
import useDebounce from "@/Components/App/Hooks/useDebounce";
import EmpleadoAdvanceDropdown from "@/Components/App/Empleado/AdvanceDropdown/AdvanceDropdown";
import { DatePicker } from "@/Components/App/DatePicker/DatePicker";
import { Separator } from "@/Components/ui/separator";
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
      {/* Row 1: Información principal */}
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2">
        {/* Campo: Nombre */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            Nombre del archivo
          </span>
          <Input
            placeholder='Nombre del archivo'
            className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
            value={localData.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
          />
          {errors.nombre && <span className="text-xs text-red-500">{errors.nombre}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            Vinculado a
          </span>
          <EmpleadoAdvanceDropdown
            defaultValue={localData.user}
            onChangeValue={(value) => handleChange('user', value)}
            enableCreateUpdateView={true}
            enableSheetTableView={true}
          />
          {errors.user && <span className="text-xs text-red-500">{errors.user}</span>}
        </div>
      </div>
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            Fecha de subida
          </span>
          <DatePicker
            className="rounded-full"
            selectedDate={localData.created_at ? new Date(localData.created_at) : undefined}
            onSelect={(date) => {
              const formattedDate = formatDate(date);
              handleChange('created_at', formattedDate);
            }}
          />
          {errors.created_at && <span className="text-xs text-red-500">{errors.created_at}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            Subido por
          </span>
          <EmpleadoAdvanceDropdown
            defaultValue={localData.created_by}
            onChangeValue={(value) => handleChange('created_by', value)}
            enableCreateUpdateView={true}
            enableSheetTableView={true}
          />
          {errors.created_by && <span className="text-xs text-red-500">{errors.created_by}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            Editado por
          </span>
          <EmpleadoAdvanceDropdown
            defaultValue={localData.updated_by}
            onChangeValue={(value) => handleChange('updated_by', value)}
            enableCreateUpdateView={true}
            enableSheetTableView={true}
          />
          {errors.updated_by && <span className="text-xs text-red-500">{errors.updated_by}</span>}
        </div>
      </div>
      {/* Separador */}
      <Separator className="bg-custom-blackSemi dark:bg-custom-white" />

      {/* Archivo vinculado */}
      <h1 className="font-bold dark:text-custom-white">Archivo vinculado</h1>
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-1">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            Remplazar archivo
          </span>
          {/* Custom File Input */}
          <div className="flex items-center px-3 h-10 w-full rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi">
            <label
              htmlFor="archivo-vinculado"
              className="flex items-center shrink-0 gap-2 cursor-pointer text-sm font-semibold text-gray-500 dark:text-gray-400 hover:dark:text-white"
            >
              <span>Seleccionar archivo</span>
            </label>
            <input
              id="archivo-vinculado"
              type="file"
              className="hidden"
              onChange={(e) => handleChange('archivo', e.target.files?.[0])}
            />
            <span className="ml-4 text-sm text-gray-500 dark:text-gray-400 truncate">
              {localData.archivo instanceof File
                ? localData.archivo.name
                : (localData.nombre_archivo || "Ningún archivo seleccionado")}
            </span>
          </div>
          {errors.archivo && <span className="text-xs text-red-500">{errors.archivo}</span>}
        </div>
      </div>
    </div>
  )
}
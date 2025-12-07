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
    <div className="flex flex-col gap-4 h-full">
      {/* Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold  text-custom-blue dark:text-custom-white">Nombre<span className="text-custom-orange"> *</span></span>
          <Input
            placeholder='Añadir nombre'
            className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
            value={localData.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
          />
          {errors.nombre && <span className="text-xs text-red-500">{errors.nombre}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Siglas<span className="text-custom-orange"> *</span></span>
          <Input
            placeholder="Siglas de la empresa"
            className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
            value={localData.siglas}
            onChange={(e) => handleChange('siglas', e.target.value)}
          />
          {errors.siglas && <span className="text-xs text-red-500">{errors.siglas}</span>}
        </div>
        <div className="flex flex-col gap-2 ">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">CIF<span className="text-custom-orange"> *</span></span>
          <Input
            placeholder="CIF de la empresa"
            className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
            value={localData.cif}
            onChange={(e) => handleChange('cif', e.target.value)}
          />
          {errors.cif && <span className="text-xs text-red-500">{errors.cif}</span>}
          <span className="text-xs text-custom-gray-semiDark dark:text-custom-gray-dark pl-1">  Este valor no puede repetirse en los registros.</span>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Representante <span className="text-custom-orange"> *</span></span>
          <EmpleadoAdvanceDropdown
            defaultValue={localData.representante_id}
            onChangeValue={(value) => handleChange('representante_id', value)}
            enableCreateUpdateView={true}
            enableSheetTableView={true}
          />
          {errors.representante_id && <span className="text-xs text-red-500">{errors.representante_id}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Adjunto <span className="text-custom-orange"> *</span></span>
          <EmpleadoAdvanceDropdown
            defaultValue={localData.adjunto_id}
            onChangeValue={(value) => handleChange('adjunto_id', value)}
            enableCreateUpdateView={true}
            enableSheetTableView={true}
          />
          {errors.adjunto_id && <span className="text-xs text-red-500">{errors.adjunto_id}</span>}
        </div>
      </div>

      <Separator className="bg-custom-blackSemi dark:bg-custom-white mt-4 mb-2" />
      <h3 className="font-bold ">Información de contacto</h3>

      {/* Sección: Información de Contacto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {/* Dirección de contacto */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            {t('tables.direccion')} <span className="text-custom-orange">*</span>
          </span>
          <GoogleAddress
            selectedAddress={localData.direccion?.full_address}
            onSelect={(placeDetails) => handleChange('direccion', { ...localData.direccion, ...placeDetails })}
            data={localData.direccion}
            handleChange={(key, value) => handleChange('direccion', { ...localData.direccion, [key]: value })}
          />
          {errors.direccion && <span className="text-xs text-red-500">{errors.direccion}</span>}
        </div>

        {/* Email y teléfono */}
        <div className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
              Email <span className="text-custom-orange">*</span>
            </span>
            <Input
              placeholder='Añadir email'
              className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
              value={localData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              type="tel"
            />
            {errors.email && (
              <span className="text-xs text-red-500">
                {errors.email}
              </span>
            )}
          </div>

          {/* Teléfono */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
              {t('tables.telefono')} <span className="text-custom-orange">*</span>
            </span>
            <Input
              placeholder='Añadir teléfono'
              className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
              value={localData.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              type="tel"
            />
            {errors.telefono && (
              <span className="text-xs text-red-500">
                {errors.telefono}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
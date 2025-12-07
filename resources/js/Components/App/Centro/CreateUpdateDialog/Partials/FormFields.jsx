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
    <div className="flex flex-col gap-4">
      {/* Row 1: Información principal */}
      <div className="grid gap-8">
        {/* Campo: Nombre */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            Nombre<span className="text-custom-orange"> *</span>
          </span>
          <Input
            placeholder='Nombre del centro'
            className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
            value={localData.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
          />
          {errors.nombre && <span className="text-xs text-red-500">{errors.nombre}</span>}
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">{t('tables.administradorcentro')}<span className="text-custom-orange"> *</span></span>
          <EmpleadoAdvanceDropdown
            defaultValue={localData.responsable_id}
            onChangeValue={(value) => handleChange('responsable_id', value)}
            enableCreateUpdateView={true}
            enableSheetTableView={true}
          />
          {errors.responsable_id && <span className="text-xs text-red-500">{errors.responsable_id}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">{t('tables.coordinador')}<span className="text-custom-orange"> *</span></span>
          <EmpleadoAdvanceDropdown
            defaultValue={localData.coordinador_id}
            onChangeValue={(value) => handleChange('coordinador_id', value)}
            enableCreateUpdateView={true}
            enableSheetTableView={true}
          />
          {errors.coordinador_id && <span className="text-xs text-red-500">{errors.coordinador_id}</span>}
        </div>
      </div>

      {/* Separador */}
      <Separator className="bg-custom-blackSemi dark:bg-custom-white" />
      <h1 className="font-bold dark:text-custom-white">Informacion de contacto</h1>

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

      {/* Separador Vinculación */}
      <Separator className="bg-custom-blackSemi dark:bg-custom-white" />
      <h1 className="font-bold dark:text-custom-white">Vinculación</h1>

      {/* Sección: Empresa y estado del centro */}
      <div className="grid grid-cols-2 gap-8">
        {/* Empresa vinculante */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            {t('tables.empresa')} <span className="text-custom-orange">*</span>
          </span>
          <AdvanceDropdown
            defaultValue={localData.empresa_id}
            onChangeValue={(value) => handleChange('empresa_id', value)}
            enableCreateUpdateView={true}
            enableSheetTableView={true}
          />
          {errors.empresa_id && <span className="text-xs text-red-500">{errors.empresa_id}</span>}
        </div>
        {/* Estado del centro */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            {t('tables.estado')} <span className="text-custom-orange">*</span>
          </span>
          <FetchSelect
            fetchRoute='api.v1.admin.centros.status'
            responseParameter='estadoCentros'
            value={localData.estado_id}
            onValueChange={(value) => handleChange('estado_id', Number(value))}
            disabled={false}
          />
          {errors.estado_id && <span className="text-xs text-red-500">{errors.estado_id}</span>}
        </div>
      </div>
    </div>
  )
}
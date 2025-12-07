import { useCallback, useEffect, useState } from "react";

import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { useDialogData } from '../Context/DialogDataContext';
import IconSelector from "@/Components/App/Navigation/IconSelector/IconSelector";
import WeightIndicator from "@/Components/App/Navigation/WeightIndicator";
import ToggleSwitch from "@/Components/App/Navigation/ToggleSwitch/ToggleSwitch";
import ApiSelector from "@/Components/App/Common/ApiSelector/ApiSelector";

import useDebounce from "@/Components/App/Hooks/useDebounce";

import Icon from "@/imports/LucideIcon";

/**
 * Componente que renderiza los campos del formulario para crear/editar un link de navegación.
 * 
 * Gestiona la entrada de datos del usuario, la validación de campos
 * y la presentación de errores de validación específicos para cada campo.
 *
 * @returns {JSX.Element} Campos del formulario con sus etiquetas y mensajes de error
 */
export default function FormFields() {
  const {
    form,
    updateForm,
    isLoading,
    model
  } = useDialogData();
  const { data, errors } = form;

  // Estado local para los inputs - usar directamente data del contexto
  const [localData, setLocalData] = useState(data);

  // Crear función debounced para actualizar el formulario real
  const debouncedUpdateForm = useDebounce(updateForm, 500);

  // Sincronizar el estado local cuando cambia data del contexto
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

  // Función para renderizar opciones de navegación padre
  const renderNavigationOption = useCallback((option) => (
    <div className="flex items-center gap-2 p-2">
      <Icon 
        name={option.icon || 'Folder'} 
        className="w-4 h-4 text-custom-orange" 
      />
      <div className="flex flex-col">
        <span className="text-sm text-custom-gray-semiDark dark:text-custom-white">
          {option.name}
        </span>
        {option.route_name && (
          <span className="text-xs text-custom-gray-default dark:text-gray-500">
            {option.route_name}
          </span>
        )}
      </div>
    </div>
  ), []);

  // Función para renderizar selección de navegación padre
  const renderNavigationSelected = useCallback((option) => (
    <div className="flex items-center gap-2">
      {option ? (
        <>
          <Icon 
            name={option.icon || 'Folder'} 
            className="w-4 h-4 text-custom-orange" 
          />
          <span className="text-sm text-custom-gray-semiDark dark:text-custom-white">
            {option.name}
          </span>
        </>
      ) : (
        <span className="text-sm text-custom-gray-default dark:text-gray-500">
          Seleccionar carpeta padre
        </span>
      )}
    </div>
  ), []);

  // Función para renderizar opciones de permisos
  const renderPermissionOption = useCallback((option) => (
    <div className="flex items-center gap-2 p-2">
      <div className="flex flex-col">
        <span className="text-sm text-custom-gray-semiDark dark:text-custom-white">
          {option.name}
        </span>
        {option.description && (
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {option.description}
          </span>
        )}
      </div>
    </div>
  ), []);

  // Función para renderizar selección de permisos (solo nombre)
  const renderPermissionSelected = useCallback((option) => (
    <div className="flex items-center gap-2">
      {option ? (
        <span className="text-sm text-custom-gray-semiDark dark:text-custom-white">
          {option.name}
        </span>
      ) : (
        <span className="text-sm text-custom-gray-default dark:text-gray-500">
          Seleccionar permiso
        </span>
      )}
    </div>
  ), []);

  // Mostrar skeleton loading mientras carga en modo edición
  if (isLoading && model) {
    return (
      <div className="flex flex-col gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Guard para evitar renderizado con datos inválidos
  if (!localData) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Sección 1: Información básica */}
      <div className="space-y-4">

        {/* 3 campos en una fila */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Campo: Icono */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
              Ícono<span className="text-custom-orange"> *</span>
            </span>
            <IconSelector
              prevSelectedIcon={localData?.icon}
              onSelect={(icon) => handleChange('icon', icon)}
              placeholder="Seleccionar ícono"
            />
            {errors.icon && <span className="text-xs text-red-500">{errors.icon}</span>}
          </div>

          {/* Campo: Nombre del link */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
              Nombre del link<span className="text-custom-orange"> *</span>
            </span>
            <Input
              placeholder='Nombre del enlace de navegación'
              className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
              value={localData?.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
          </div>

          {/* Campo: Descripción */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
              Descripción
            </span>
            <Textarea
              placeholder='Descripción del enlace de navegación'
              className="rounded-lg dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi min-h-[80px]"
              value={localData?.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
            />
            {errors.description && <span className="text-xs text-red-500">{errors.description}</span>}
          </div>
        </div>
      </div>


      {/* Sección 2: Jerarquía y Permisos */}
      <div className="space-y-4">

        {/* 3 campos en una fila */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Campo: Padre (Grupo/Carpeta) */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
              Padre (Grupo/Carpeta)
            </span>
            <ApiSelector
              apiUrl={route('api.v1.admin.navigation.index')}
              prevSelectedValue={localData?.parent_id || null}
              onSelect={(item) => handleChange('parent_id', item ? item.id : null)}
              placeholder="Seleccionar carpeta padre"
              searchPlaceholder="Buscar carpeta..."
              renderOption={renderNavigationOption}
              renderSelected={renderNavigationSelected}
              dataKey="links"
              allowClear={true}
            />
            {errors.parent_id && <span className="text-xs text-red-500">{errors.parent_id}</span>}
          </div>

          {/* Campo: Permisos */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
              Permisos
            </span>
            <ApiSelector
              apiUrl={route('api.v1.admin.permissions.index')}
              prevSelectedValue={localData?.permission_id || null}
              onSelect={(item) => handleChange('permission_id', item ? item.id : null)}
              placeholder="Seleccionar permiso"
              searchPlaceholder="Buscar permisos..."
              renderOption={renderPermissionOption}
              renderSelected={renderPermissionSelected}
              dataKey="permissions"
              allowClear={true}
            />
            {errors.permission_id && <span className="text-xs text-red-500">{errors.permission_id}</span>}
          </div>

          {/* Campo: Ruta */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
              Ruta
            </span>
            <Input
              placeholder='/admin/dashboard'
              className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
              value={localData?.route_name || ''}
              onChange={(e) => handleChange('route_name', e.target.value)}
            />
            {errors.route_name && <span className="text-xs text-red-500">{errors.route_name}</span>}
          </div>
        </div>
      </div>


      {/* Sección 3: Configuración */}
      <div className="space-y-4">

        {/* 3 campos en una fila */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Campo: Peso */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
              Peso
            </span>
            <WeightIndicator
              weight={localData?.weight || 1}
              interactive={true}
              onWeightChange={(weight) => handleChange('weight', weight)}
            />
            {errors.weight && <span className="text-xs text-red-500">{errors.weight}</span>}
          </div>

          {/* Campo: ¿Es importante? */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
              ¿Es importante?
            </span>
            <ToggleSwitch
              checked={localData?.is_important || false}
              onChange={(checked) => handleChange('is_important', checked)}
              label=""
              trueLabel="Sí"
              falseLabel="No"
            />
            {errors.is_important && <span className="text-xs text-red-500">{errors.is_important}</span>}
          </div>

          {/* Campo: ¿Es reciente? */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
              ¿Es reciente?
            </span>
            <ToggleSwitch
              checked={localData?.is_recent || false}
              onChange={(checked) => handleChange('is_recent', checked)}
              label=""
              trueLabel="Sí"
              falseLabel="No"
            />
            {errors.is_recent && <span className="text-xs text-red-500">{errors.is_recent}</span>}
          </div>

          {/* Campo: ¿Requiere empleado? */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
              ¿Requiere empleado?
            </span>
            <div className="flex items-center gap-2">
              <Icon name="Users" className="w-4 h-4 text-custom-orange" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Si está activado, solo usuarios con empleado asignado verán este enlace
              </span>
            </div>
            <ToggleSwitch
              checked={localData?.requires_employee || false}
              onChange={(checked) => handleChange('requires_employee', checked)}
              label=""
              trueLabel="Sí"
              falseLabel="No"
            />
            {errors.requires_employee && <span className="text-xs text-red-500">{errors.requires_employee}</span>}
          </div>
        </div>
      </div>

    </div>
  );
}
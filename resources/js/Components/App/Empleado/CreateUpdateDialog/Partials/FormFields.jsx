import { Input } from "@/Components/ui/input";
import { Separator } from "@/Components/ui/separator";
import GoogleAddress from "@/Components/App/Direccion/GoogleAddress";
import { useDialogData } from '../Context/DialogDataContext';
import { useCallback, useEffect, useState } from "react";
import useDebounce from "@/Components/App/Hooks/useDebounce";
import FetchSelect from "@/Components/App/FetchSelect/FetchSelect";
import DocumentField from "@/Components/App/DocumentField/DocumentField";
import DatePicker from "@/Components/App/DatePicker/DatePicker";
import { validateCompleteDocumentSeparatedSync, fetchDocumentTypes, documentValidationManager } from "@/Components/App/Empleado/CreateUpdateDialog/Utils/documentValidation";
import { usePage } from '@inertiajs/react';

/**
 * Formatea una fecha a YYYY-MM-DD evitando problemas de zona horaria
 * @param {Date} date - Fecha a formatear
 * @returns {string} - Fecha en formato YYYY-MM-DD
 */
const formatDateToString = (date) => {
  if (!date) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
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
  const { auth } = usePage().props;

  // Verificar si el usuario puede ver observaciones de salud
  const canViewHealthObservations = auth.user?.roles?.some(role => 
    ['Administrator', 'Super Admin'].includes(role.name)
  );

  // Estado local para los inputs
  const [localData, setLocalData] = useState(data);
  // Estado para errores de validación locales
  const [localErrors, setLocalErrors] = useState({});
  // Estado para controlar si ya se mostró un error (para mantenerlo fijo)
  const [hasShownError, setHasShownError] = useState(false);
  // Estado para rastrear si inicialmente había una fecha de caducidad
  const [hadInitialDate, setHadInitialDate] = useState(false);
  // Estado para controlar cuándo mostrar el error de fecha de caducidad
  const [shouldShowDateError, setShouldShowDateError] = useState(false);

  // Crear función debounced para actualizar el formulario real
  const debouncedUpdateForm = useDebounce(updateForm, 500);

  // Pre-cargar tipos de documentos al montar el componente
  useEffect(() => {
    fetchDocumentTypes().catch(() => {
      // Error silencioso al cargar tipos de documentos
    });
  }, []);

  // Sincronizar el estado local cuando cambia data y detectar fecha inicial
  useEffect(() => {
    setLocalData(data);
    // Detectar si había una fecha inicialmente (para modo edición)
    if (data.caducidad_nif && data.caducidad_nif.trim()) {
      setHadInitialDate(true);
    }
  }, [data.id]);

  // Función para validar documento con debounce usando el manager
  const validateDocumentWithDebounce = useCallback((tipoDocumentoId, documentNumber) => {
    // Si no hay datos para validar, limpiar errores
    if (!tipoDocumentoId || !documentNumber) {
      setLocalErrors(prev => ({
        ...prev,
        nif_format_validation: ''
      }));
      setHasShownError(false);
      return;
    }

    // Solo validar si hay contenido en el campo
    if (!documentNumber.trim()) {
      setLocalErrors(prev => ({
        ...prev,
        nif_format_validation: ''
      }));
      setHasShownError(false);
      return;
    }

    // Usar el manager para validación con estado persistente
    const validationKey = `nif_${tipoDocumentoId}_${documentNumber}`;
    
    documentValidationManager.validateWithState(validationKey, tipoDocumentoId, documentNumber, 800)
      .then(validation => {
        const hasError = !validation.isValid && documentNumber.trim() !== '';
        
        setLocalErrors(prev => ({
          ...prev,
          nif_format_validation: validation.isValid ? '' : validation.message
        }));
        
        // Solo marcar error si hay contenido y es inválido
        if (hasError && documentNumber.trim()) {
          setHasShownError(true);
        }
        
        // Si es válido, resetear el estado de error mostrado
        if (validation.isValid) {
          setHasShownError(false);
        }
      })
      .catch(error => {
        console.error('Error en validación de documento:', error);
      });
  }, []);

  // Validar el documento cuando cambien los datos relevantes
  useEffect(() => {
    if (localData.tipo_documento_id && localData.nif) {
      validateDocumentWithDebounce(localData.tipo_documento_id, localData.nif);
    } else {
      // Limpiar errores si no hay datos para validar
      setLocalErrors(prev => ({
        ...prev,
        nif_format_validation: ''
      }));
      setHasShownError(false);
    }
  }, [localData.tipo_documento_id, localData.nif, validateDocumentWithDebounce]);

  // Validar fecha de caducidad solo cuando corresponde
  useEffect(() => {
    if (shouldShowDateError) {
      if (localData.caducidad_nif) {
        const validation = validateCompleteDocumentSeparatedSync(
          localData.tipo_documento_id, 
          localData.nif,
          localData.caducidad_nif
        );
        
        setLocalErrors(prev => ({
          ...prev,
          date_expiration_validation: validation.expirationValid ? '' : validation.expirationMessage
        }));
      } else {
        setLocalErrors(prev => ({
          ...prev,
          date_expiration_validation: 'La fecha de caducidad es obligatoria'
        }));
      }
    } else {
      // Limpiar el error si no se debe mostrar
      setLocalErrors(prev => ({
        ...prev,
        date_expiration_validation: ''
      }));
    }
  }, [localData.caducidad_nif, localData.tipo_documento_id, localData.nif, shouldShowDateError]);

  // Detectar cuando se elimina una fecha existente o cuando hay errores del backend
  useEffect(() => {
    // Caso 1: Error del backend (cuando se intenta guardar con campo vacío)
    if (errors.caducidad_nif) {
      setShouldShowDateError(true);
      return;
    }

    // Caso 2: Se eliminó una fecha que existía previamente
    if (hadInitialDate && !localData.caducidad_nif) {
      setShouldShowDateError(true);
      return;
    }

    // Si no se cumplen las condiciones, no mostrar error
    if (!errors.caducidad_nif && (!hadInitialDate || localData.caducidad_nif)) {
      setShouldShowDateError(false);
    }
  }, [errors.caducidad_nif, hadInitialDate, localData.caducidad_nif]);

  // Función para manejar cambios en inputs con actualización inmediata de UI
  const handleChange = useCallback((key, value) => {

    // Actualizar inmediatamente el estado local para mejor UX
    if (typeof key === 'object') {
      setLocalData(prev => ({ ...prev, ...key }));
    } else {
      setLocalData(prev => ({ ...prev, [key]: value }));
    }

    // Eliminar el error correspondiente si existe
    if (errors[key]) {
      delete errors[key];
    }

    // Para el campo NIF, resetear error si el campo está vacío
    if (key === 'nif') {
      if (!value.trim()) {
        setHasShownError(false);
        setLocalErrors(prev => ({ ...prev, nif_format_validation: '' }));
      }
    }

    // Para caducidad_nif, actualizar inmediatamente sin debounce
    if (key === 'caducidad_nif') {
      updateForm(key, value);
      // Si se selecciona una fecha válida, limpiar el flag de error
      if (value && value.trim()) {
        setShouldShowDateError(false);
      }
    } else {
      // Actualizar el formulario real con debounce para otros campos
      debouncedUpdateForm(key, value);
    }
  }, [debouncedUpdateForm, updateForm, errors]);

  // Función para manejar el blur del campo NIF (validación final)
  const handleNifBlur = useCallback(() => {
    if (localData.tipo_documento_id && localData.nif && localData.nif.trim()) {
      // Solo validar si hay contenido en el campo
      const validation = validateCompleteDocumentSeparatedSync(
        localData.tipo_documento_id, 
        localData.nif,
        localData.caducidad_nif
      );
      
      const hasError = !validation.formatValid && localData.nif.trim() !== '';
      
      setLocalErrors(prev => ({
        ...prev,
        nif_format_validation: validation.formatValid ? '' : validation.formatMessage
      }));
      
      // Solo marcar error si hay contenido y es inválido
      if (hasError && localData.nif.trim()) {
        setHasShownError(true);
      }
    } else {
      // Si no hay contenido, limpiar errores
      setLocalErrors(prev => ({
        ...prev,
        nif_format_validation: ''
      }));
      setHasShownError(false);
    }
  }, [localData.tipo_documento_id, localData.nif, localData.caducidad_nif]);

  // Limpiar estados de validación al desmontar
  useEffect(() => {
    return () => {
      // Limpiar todos los estados de validación al desmontar el componente
      documentValidationManager.clearAllStates();
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 h-screen">
      {/* Sección: Información Personal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Campo: Nombre */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            Nombre<span className="text-custom-orange"> *</span>
          </span>
          <Input
            placeholder='Nombre'
            className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
            value={localData.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
          />
          {errors.nombre && <span className="text-xs text-red-500">{errors.nombre}</span>}
        </div>

        {/* Campo: Primer Apellido */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            Primer apellido<span className="text-custom-orange"> *</span>
          </span>
          <Input
            placeholder='Primer apellido'
            className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
            value={localData.primer_apellido}
            onChange={(e) => handleChange('primer_apellido', e.target.value)}
          />
          {errors.primer_apellido && <span className="text-xs text-red-500">{errors.primer_apellido}</span>}
        </div>

        {/* Campo: Segundo Apellido */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            Segundo apellido<span className="text-custom-orange"> *</span>
          </span>
          <Input
            placeholder='Segundo apellido'
            className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
            value={localData.segundo_apellido}
            onChange={(e) => handleChange('segundo_apellido', e.target.value)}
          />
          {errors.segundo_apellido && <span className="text-xs text-red-500">{errors.segundo_apellido}</span>}
        </div>
      </div>

      {/* Sección: Documentación */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Campo: Tipo de Documento */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            Tipo de documento<span className="text-custom-orange"> *</span>
          </span>
          <FetchSelect
            fetchRoute='api.v1.admin.empleados.type-documents'
            responseParameter='tipoDocumentos'
            value={localData.tipo_documento_id}
            onValueChange={(value) => handleChange('tipo_documento_id', value)}
            disabled={false}
          />
          {errors.tipo_documento_id && <span className="text-xs text-red-500">{errors.tipo_documento_id}</span>}
        </div>

        {/* Campo: Número de Documento con Caducidad */}
        <DocumentField
          documentNumber={localData.nif}
          onDocumentNumberChange={(value) => handleChange('nif', value)}
          onDocumentNumberBlur={handleNifBlur}
          errors={{
            ...errors,
            nif_format_validation: (hasShownError && localData.nif && localData.nif.trim()) ? localErrors.nif_format_validation : ''
          }}
          required={true}
          showCalendar={false}
        />

        {/* Fecha de caducidad del documento */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            Fecha de caducidad del documento<span className="text-custom-orange"> *</span>
          </span>
          <DatePicker
            className="rounded-full"
            selectedDate={localData.caducidad_nif ? new Date(localData.caducidad_nif) : undefined}
            onSelect={(date) => {
              const formattedDate = formatDateToString(date);
              handleChange('caducidad_nif', formattedDate);
            }}
          />
          {errors.caducidad_nif ? (
            <span className="text-xs text-red-500">{errors.caducidad_nif}</span>
          ) : (
            localErrors.date_expiration_validation && (
              <span className="text-xs text-red-500">{localErrors.date_expiration_validation}</span>
            )
          )}
        </div>
      </div>

      {/* Sección: Información Adicional */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Campo: Tipo de Empleado */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            Tipo de empleado<span className="text-custom-orange"> *</span>
          </span>
          <FetchSelect
            fetchRoute='api.v1.admin.empleados.types'
            responseParameter='tipos'
            value={localData.tipo_empleado_id}
            onValueChange={(value) => handleChange('tipo_empleado_id', value)}
            disabled={false}
          />
          {errors.tipo_empleado_id && <span className="text-xs text-red-500">{errors.tipo_empleado_id}</span>}
        </div>

        {/* Campo: Fecha de Nacimiento */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            Fecha de nacimiento<span className="text-custom-orange"> *</span>
          </span>
          <DatePicker
            className="rounded-full"
            selectedDate={localData.fecha_nacimiento ? new Date(localData.fecha_nacimiento) : undefined}
            onSelect={(date) => {
              const formattedDate = formatDateToString(date);
              handleChange('fecha_nacimiento', formattedDate);
            }}
          />
          {errors.fecha_nacimiento && <span className="text-xs text-red-500">{errors.fecha_nacimiento}</span>}
        </div>

        {/* Campo: Género */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            Género<span className="text-custom-orange"> *</span>
          </span>
          <FetchSelect
            fetchRoute='api.v1.admin.empleados.genders'
            responseParameter='generos'
            value={localData.genero_id}
            onValueChange={(value) => handleChange('genero_id', value)}
            disabled={false}
          />
          {errors.genero_id && <span className="text-xs text-red-500">{errors.genero_id}</span>}
        </div>
      </div>

      {/* Separador y título de sección */}
      <Separator className="bg-custom-blackSemi dark:bg-custom-white" />
      <h1 className="font-bold dark:text-custom-white">Información de contacto</h1>

      {/* Sección: Información de Contacto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {/* Campo: Dirección */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            Dirección<span className="text-custom-orange"> *</span>
          </span>
          <GoogleAddress
            selectedAddress={localData.direccion.full_address}
            onSelect={(placeDetails) => handleChange('direccion', { ...localData.direccion, ...placeDetails })}
            data={localData.direccion}
            handleChange={(key, value) => handleChange('direccion', { ...localData.direccion, [key]: value })}
          />
          {errors.direccion && <span className="text-xs text-red-500">{errors.direccion}</span>}
        </div>

        {/* Campos: Teléfonos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Teléfono Principal */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
              Teléfono<span className="text-custom-orange"> *</span>
            </span>
            <Input
              placeholder='Teléfono'
              className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
              value={localData.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              type="tel"
            />
            {errors.telefono && <span className="text-xs text-red-500">{errors.telefono}</span>}
          </div>
          {/* Teléfono personal movil */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
              Teléfono personal móvil
            </span>
            <Input
              placeholder='Teléfono personal móvil'
              className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
              value={localData.telefono_personal_movil}
              onChange={(e) => handleChange('telefono_personal_movil', e.target.value)}
              type="tel"
            />
            {errors.telefono_personal_movil && <span className="text-xs text-red-500">{errors.telefono_personal_movil}</span>}
          </div>
          {/* Teléfono personal fijo */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
              Teléfono personal fijo
            </span>
            <Input
              placeholder='Teléfono personal fijo'
              className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
              value={localData.telefono_personal_fijo}
              onChange={(e) => handleChange('telefono_personal_fijo', e.target.value)}
              type="tel"
            />
            {errors.telefono_personal_fijo && <span className="text-xs text-red-500">{errors.telefono_personal_fijo}</span>}
          </div>
          {/* Extensión Centrex */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
              Extensión Centrex
            </span>
            <Input
              placeholder='Extensión Centrex'
              className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
              value={localData.extension_centrex}
              onChange={(e) => handleChange('extension_centrex', e.target.value)}
            />
            {errors.extension_centrex && <span className="text-xs text-red-500">{errors.extension_centrex}</span>}
          </div>
        </div>
      </div>

      {/* Sección: Correos Electrónicos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {/* Email Principal */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            Email<span className="text-custom-orange"> *</span>
          </span>
          <Input
            placeholder='Email'
            className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
            value={localData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
          {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
        </div>
        {/* Email Secundario */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            Email secundario
          </span>
          <Input
            placeholder='Email secundario'
            className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
            value={localData.email_secundario}
            onChange={(e) => handleChange('email_secundario', e.target.value)}
          />
          {errors.email_secundario && <span className="text-xs text-red-500">{errors.email_secundario}</span>}
        </div>
      </div>

      {/* Sección: Contacto de Emergencia */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        {/* Nombre del Contacto de Emergencia */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            Contacto de emergencia
          </span>
          <Input
            placeholder='Contacto de emergencia'
            className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
            value={localData.contacto_emergencia}
            onChange={(e) => handleChange('contacto_emergencia', e.target.value)}
          />
          {errors.contacto_emergencia && <span className="text-xs text-red-500">{errors.contacto_emergencia}</span>}
        </div>
        {/* Teléfono de Emergencia */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            Teléfono de emergencia
          </span>
          <Input
            placeholder='Teléfono de emergencia'
            className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
            value={localData.telefono_emergencia}
            onChange={(e) => handleChange('telefono_emergencia', e.target.value)}
          />
          {errors.telefono_emergencia && <span className="text-xs text-red-500">{errors.telefono_emergencia}</span>}
        </div>

        {/* Campo de observaciones de salud - Solo visible para administradores */}
        {canViewHealthObservations && (
          <div className="grid grid-cols-1 lg:gap-2 sm:gap-8">
            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
              Observaciones de salud
              <span className="text-xs text-gray-500 ml-1">(Opcional - Solo visible para administradores)</span>
            </span>
            <textarea
              placeholder="Información médica relevante, alergias, condiciones especiales..."
              className="flex w-full rounded-[20px] border-none bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:border-gray-500 dark:focus-visible:border-white disabled:cursor-not-allowed disabled:opacity-50 dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi resize-none"
              value={localData.observaciones_salud || ''}
              onChange={(e) => handleChange('observaciones_salud', e.target.value)}
              rows={3}
            />
            {errors.observaciones_salud && <span className="text-xs text-red-500">{errors.observaciones_salud}</span>}
          </div>
        )}
      </div>

      {/* Separador y título de sección */}
      <Separator className="bg-custom-blackSemi dark:bg-custom-white" />
      <h1 className="font-bold dark:text-custom-white">Información del empleado</h1>

      {/* Sección: Información de Empleado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Campo: Asociación de Usuario */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            Asociar usuario
          </span>
          {!localData.create_user ? (
            <FetchSelect
              fetchRoute='api.v1.admin.users.index'
              responseParameter='users'
              value={localData.user_id}
              onValueChange={(value) => handleChange('user_id', value)}
              disabled={false}
            />
          ) : (
            <div className='w-full h-10 bg-custom-gray-default dark:bg-custom-blackSemi rounded-full cursor-not-allowed' />
          )}
          {errors.user_id && <span className="text-xs text-red-500">{errors.user_id}</span>}
          {/* Checkbox para crear un usuario */}
          <div className="flex flex-col w-full">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localData.create_user}
                onChange={(e) => handleChange('create_user', e.target.checked)}
                className="text-custom-orange bg-transparent focus:ring-custom-orange mr-2"
              />
              <p className="dark:text-custom-white">¿Desea crear un usuario?</p>
            </div>
            <p className='text-xs ml-8 mt-1 opacity-70'>
              Se creará un usuario con la información del empleado
            </p>
          </div>
        </div>
        {/* Campo: Estado */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            Estado<span className="text-custom-orange"> *</span>
          </span>
          <FetchSelect
            fetchRoute='api.v1.admin.empleados.status'
            responseParameter='estados'
            value={localData.estado_id}
            onValueChange={(value) => handleChange('estado_id', value)}
            disabled={false}
          />
          {errors.estado_id && <span className="text-xs text-red-500">{errors.estado_id}</span>}
        </div>
        {/* Campo: NISS */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            NISS<span className="text-custom-orange"> *</span>
          </span>
          <Input
            placeholder='NISS'
            className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
            value={localData.niss}
            onChange={(e) => handleChange('niss', e.target.value)}
          />
          {errors.niss && <span className="text-xs text-red-500">{errors.niss}</span>}
        </div>
      </div>
    </div>
  )
}
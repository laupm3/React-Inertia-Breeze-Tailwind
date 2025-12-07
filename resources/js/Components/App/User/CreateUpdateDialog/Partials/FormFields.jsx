import { useCallback, useEffect, useState } from "react";
import { Input } from "@/Components/ui/input";
import { Button } from '@/Components/App/Buttons/Button';
import { Separator } from "@/Components/ui/separator";
import { useDialogData } from '../Context/DialogDataContext';
import Icon from '@/imports/LucideIcon';
import useDebounce from "@/Components/App/Hooks/useDebounce";
import FetchSelect from "@/Components/App/FetchSelect/FetchSelect";
import EmpleadoAdvanceDropdown from "@/Components/App/Empleado/AdvanceDropdown/AdvanceDropdown";
import { DateTimePicker24h } from "@/Components/App/DateTimePicker/DateTimePicker";
import UserStatusAdvanceDropdown from "@/Components/App/User/Status/AdvanceDropdown/AdvanceDropdown";
import { getUserTimezone, convertJavaScriptDateToUTC } from "../Utils/dateHelpers";
import { Alert } from "@/Components/ui/alert";


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
    model,
    updateForm,
    onSaveData,
    dataKey
  } = useDialogData();
  const { data, errors } = form;

  useEffect(() => {
    if (data.photo && typeof data.photo === 'string' && data.photo.startsWith('http')) {
      setPhotoPreview(data.photo);
    }
  }, [data.photo]);

  // Estado local para los inputs
  const [localData, setLocalData] = useState({
    ...data,
    photo: data.photo && typeof data.photo === 'string' && data.photo.startsWith('http') ? null : data.photo
  });
  const [photoPreview, setPhotoPreview] = useState(data.photo || null);

  // Crear función debounced para actualizar el formulario real
  const debouncedUpdateForm = useDebounce(updateForm, 500);

  // Sincronizar el estado local cuando cambia data
  useEffect(() => {
    const isRemotePhoto = typeof data.photo === 'string' && data.photo.startsWith('http');

    // Función helper para convertir fechas
    const parseDate = (dateValue) => {
      if (!dateValue) return null;
      if (dateValue instanceof Date) return dateValue;
      try {
        const date = new Date(dateValue);
        return isNaN(date.getTime()) ? null : date;
      } catch (error) {
        console.error('Error parsing date:', dateValue, error);
        return null;
      }
    };

    setLocalData({
      ...data,
      photo: isRemotePhoto ? null : data.photo,
      status_initial_date: parseDate(data.status_initial_date),
      status_final_date: parseDate(data.status_final_date),
    });

    setPhotoPreview(
      (data.photo && data.photo instanceof File)
        ? URL.createObjectURL(data.photo)
        : (data.photo)
          ? data.photo
          : null
    );
  }, [data]);

  // Función para manejar cambios en inputs con actualización inmediata de UI
  const handleChange = useCallback((key, value) => {
    // Convertir fechas a formato ISO UTC antes de enviar al backend
    let processedValue = value;
    if ((key === 'status_initial_date' || key === 'status_final_date') && value) {
      // Si es un objeto Date, convertirlo a ISO UTC
      if (value instanceof Date) {
        processedValue = value.toISOString();
      } else {
        // Si es un string, intentar convertirlo
        processedValue = convertJavaScriptDateToUTC(value);
      }
    }

    // Actualizar inmediatamente el estado local para mejor UX
    if (typeof key === 'object') {
      setLocalData(prev => ({
        ...prev,
        ...key
      }));
    } else {
      setLocalData(prev => ({
        ...prev,
        [key]: value // Mantener el valor original para la UI
      }));
    }

    // Eliminar el error correspondiente si existe
    if (errors[key]) {
      delete errors[key];
    }

    // Actualizar el formulario real con debounce usando el valor procesado
    debouncedUpdateForm(key, processedValue);
  }, [debouncedUpdateForm]);

  const deletePhoto = async () => {
    try {
      const response = await axios.delete(route('api.v1.admin.users.profile-photo.destroy', { id: model }));

      if (onSaveData) {
        onSaveData(response.data[dataKey]);
      }
    } catch (error) {
      console.error('Error al eliminar la foto:', error);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-screen">
      {/* photo */}
      <div className="flex items-center gap-4 p-4">
        {/* Input oculto */}
        <input
          id="photo"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              handleChange('photo', file);
              const reader = new FileReader();
              reader.onloadend = () => {
                setPhotoPreview(reader.result);
              };
              reader.readAsDataURL(file);
            }
          }}
        />

        {/* Foto actual o preview */}
        <div className="flex flex-col items-center mt-2">
          {photoPreview ? (
            <span
              className="block rounded-full w-32 h-32 bg-cover bg-no-repeat bg-center shadow-md"
              style={{ backgroundImage: `url('${photoPreview}')` }}
            />
          ) : localData.photo_url ? (
            <img
              src={localData.photo_url}
              alt="Foto actual"
              className="rounded-full h-32 w-32 object-cover shadow-md"
            />
          ) : (
            <div className="flex items-center justify-center rounded-full h-32 w-32 bg-blue-100 text-blue-600 text-4xl font-bold">
              {localData.name?.[0] || '?'}
            </div>
          )}
        </div>

        {/* Controles */}
        <div className="flex flex-col">
          <div className='flex flex-row items-center gap-4'>
            <Button
              variant="primary"
              onClick={() => document.getElementById('photo').click()}
              className="gap-4"
            >
              <Icon name="Upload" size='16' />
              Subir Foto
            </Button>

            {localData.photo && (
              <Button
                variant="destructive"
                onClick={() => {
                  handleChange('photo', null);
                  deletePhoto();
                  setPhotoPreview(null);
                }}
                className="gap-4"
              >
                <Icon name='Trash' size='16' />
                Eliminar foto
              </Button>
            )}
          </div>

          <span className="text-sm mt-4 text-gray-500">Solo se permiten imágenes JPG y PNG de hasta 2MB.</span>
        </div>
      </div>
      {/* Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="flex flex-col gap-2">
          <span className="font-bold text-custom-blue dark:text-custom-orange">Alias<span className="text-custom-orange">*</span></span>
          <Input
            placeholder='Alias del usuario'
            className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
            value={localData.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
          />
          {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-bold text-custom-blue dark:text-custom-orange">Email<span className="text-custom-orange">*</span></span>
          <Input
            placeholder='Email del usuario'
            className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
            value={localData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
          />
          {errors.email && <span className="text-red-500 text-sm">{errors.email}</span>}
        </div>
      </div>

      <Separator className="bg-custom-gray-darker dark:bg-custom-white" />
      <h1 className="font-bold text-custom-blue dark:text-custom-orange">Estado del usuario</h1>

      <Alert
        className="
          mb-4 flex justify-center items-center
          bg-blue-50 text-gray-800
          font-medium py-3 gap-2
          border-none
          dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700
        "
      >
        <div>
          <Icon name="Info" size="18" className="text-blue-500 dark:text-blue-400" />
        </div>
        <div className="flex-1 text-blue-500 dark:text-blue-400">
          El estado del usuario determina su visibilidad y permisos en la plataforma. Asegúrate de seleccionar el estado correcto antes de guardar.
        </div>
      </Alert>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="flex flex-col gap-2">
          <span className="font-bold text-custom-blue dark:text-custom-orange">Estado del usuario <span className="text-custom-orange">*</span></span>
          <UserStatusAdvanceDropdown
            defaultValue={localData.status || null}
            onChangeValue={(value) => handleChange('status', Number(value))}
          />
          {errors.status && <span className="text-red-500 text-sm">{errors.status}</span>}
        </div>
        <div className="flex gap-2 w-full">
          <div className="flex flex-col flex-1 gap-2">
            <span className="font-bold text-custom-blue dark:text-custom-orange">
              Iniciar cambio
              <span className="text-xs font-normal text-gray-500 ml-2">
                ({getUserTimezone()})
              </span>
            </span>
            <DateTimePicker24h
              value={localData.status_initial_date instanceof Date ? localData.status_initial_date : null}
              onChange={(value) => handleChange('status_initial_date', value)}
              disabled={false}
              format="PP, HH:mm"
              modal={true}
            />
            {errors.status_initial_date && <span className="text-red-500 text-sm">{errors.status_initial_date}</span>}
          </div>

          {/* Mostrar fecha de baja solo cuando se está editando un usuario existente */}
          {model && (
            <div className="flex flex-col flex-1 gap-2">
              <span className="font-bold text-custom-blue dark:text-custom-orange">
                Detener cambio
                <span className="text-xs font-normal text-gray-500 ml-2">
                  ({getUserTimezone()})
                </span>
              </span>
              <DateTimePicker24h
                value={localData.status_final_date instanceof Date ? localData.status_final_date : null}
                onChange={(value) => handleChange('status_final_date', value)}
                disabled={false}
                format="PP, HH:mm"
                modal={true}
              />
              {errors.status_final_date && <span className="text-red-500 text-sm">{errors.status_final_date}</span>}
            </div>
          )}
        </div>
      </div>

      <Separator className="bg-custom-gray-darker dark:bg-custom-white" />
      <h1 className="text-lg font-bold text-custom-blue dark:text-custom-orange">Vinculación</h1>

      {/* Row 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="flex flex-col gap-2">
          <span className="font-bold text-custom-blue dark:text-custom-orange">Asociar Empleado</span>
          <EmpleadoAdvanceDropdown
            defaultValue={localData.empleado_id || null}
            onChangeValue={(value) => handleChange('empleado_id', value)}
            enableCreateUpdateView={true}
            enableSheetTableView={true}
          />
          {errors.empleado_id && <span className="text-red-500 text-sm">{errors.empleado_id}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-bold text-custom-blue dark:text-custom-orange">Asignar Rol <span className="text-custom-orange">*</span></span>
          <FetchSelect
            fetchRoute='api.v1.admin.roles.index'
            responseParameter='roles'
            value={localData.role_id || null}
            onValueChange={(value) => handleChange('role_id', parseInt(value, 10))}
            disabled={false}
          />
          {errors.role_id && <span className="text-red-500 text-sm">{errors.role_id}</span>}
        </div>
      </div>
    </div>
  )
}

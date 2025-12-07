import { Input } from "@/Components/ui/input";
import { useDialogData } from '../Context/DialogDataContext';
import { useCallback, useEffect, useState } from "react";
import useDebounce from "@/Components/App/Hooks/useDebounce";
import { calculateTotalWeekHours } from "@/Pages/Admin/Jornadas/Utils/functions";
import Icon from '@/imports/LucideIcon';
import DayItem from "./DayItem";
import WeekdayPreview from "./WeekdayPreview";

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
  const [dataLoaded, setDataLoaded] = useState(false);
  const [modalidades, setModalidades] = useState([]);
  const [turnos, setTurnos] = useState([]);

  // Crear función debounced para actualizar el formulario real
  const debouncedUpdateForm = useDebounce(updateForm, 500);
  const weekdayNumbers = [0, 1, 2, 3, 4, 5, 6];
  const weekdayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // Función para sincronizar datos inmediatamente (sin debounce)
  const syncDataImmediately = useCallback(() => {
    updateForm(localData);
  }, [localData, updateForm]);

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

  // Función para detectar días incompletos (turno sin modalidad)
  const getIncompleteDays = useCallback(() => {
    return localData.esquema?.filter(day => day.turno_id && !day.modalidad_id) || [];
  }, [localData.esquema]);

  // Cargar datos de modalidades y turnos solo una vez cuando el componente se monte
  useEffect(() => {
    if (!dataLoaded) {
      const fetchData = async () => {
        try {
          // Realizar ambas solicitudes en paralelo para mayor eficiencia
          const [modalidadesResponse, turnosResponse] = await Promise.all([
            axios.get(route('api.v1.admin.modalidades.index')),
            axios.get(route('api.v1.admin.turnos.index'))
          ]);

          if (modalidadesResponse.status === 200) {
            setModalidades(modalidadesResponse.data.modalidades);
          }

          if (turnosResponse.status === 200) {
            setTurnos(turnosResponse.data.turnos);
          }

          // Marcar datos como cargados para evitar futuras llamadas
          setDataLoaded(true);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    }
  }, [dataLoaded]);

  return (
    <div className="flex flex-col gap-4">
      {/* Nombre */}
      <div className="flex flex-col gap-2 ">
        <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
          Nombre <span className="text-custom-orange">*</span>
        </span>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Nombre de la jornada"
            className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi flex-1"
            value={localData.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
          <div className="relative">
            <Input
              readOnly
              tabIndex="-1"
              value={`${calculateTotalWeekHours(localData.esquema)} h`}
              className="rounded-full dark:text-custom-gray-default text-custom-gray-dark bg-custom-gray-default dark:bg-custom-blackSemi w-[120px] text-center pl-8 pointer-events-none select-none"
            />
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
              <Icon name="Clock" className="text-custom-orange w-4 h-4" />
            </div>
            <span className="absolute -top-7 text-sm font-bold text-custom-blue dark:text-custom-white">
              H. Semanales
            </span>
          </div>
        </div>
        {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
      </div>

      {/* Descripción */}
      <div className="flex flex-col gap-2 ">
        <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
          Descripción
        </span>
        <Input
          placeholder="Descripción de la jornada"
          className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
          value={localData.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
        {errors.description && <span className="text-xs text-red-500">{errors.description}</span>}
      </div>

      {/* Preview de la jornada */}
      <div className="">
        {dataLoaded && (
          <WeekdayPreview
            esquema={localData.esquema || []}
            turnos={turnos}
            modalidades={modalidades}
          />
        )}
      </div>

      {/* Esquema de Jornada */}
      <div className="mt-4">
        <h3 className="text-sm font-bold text-custom-blue dark:text-custom-white mb-2">Esquema de Jornada</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr >
                <th className="p-2 text-left">Día</th>
                <th className="p-2 text-left">Turno</th>
                <th className="p-2 text-left">Modalidad</th>
              </tr>
            </thead>
            <tbody>
              {weekdayNumbers.map((index) => (
                <DayItem
                  key={index}
                  weekdayName={weekdayNames[index]}
                  weekday={
                    localData.esquema.find(({ weekday_number }) => weekday_number === index) || {
                      turno_id: null,
                      modalidad_id: null,
                      weekday_number: index
                    }
                  }
                  prevData={localData}
                  sincronizePrevData={handleChange}
                  turnos={turnos}
                  modalidades={modalidades}
                />
              ))}
            </tbody>
          </table>
        </div>

        {errors.esquema && <span className="text-xs text-red-500 mt-1">{errors.esquema}</span>}
        
        {/* Mensaje de validación para días incompletos */}
        {getIncompleteDays().length > 0 && (
          <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <span className="text-sm text-red-600 dark:text-red-400">
              ⚠️ Días incompletos: {getIncompleteDays().map(day => weekdayNames[day.weekday_number]).join(', ')}
              <br />
              <span className="text-xs">Todos los turnos deben tener una modalidad asignada.</span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

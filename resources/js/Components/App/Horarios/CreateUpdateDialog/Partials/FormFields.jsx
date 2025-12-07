import { useCallback, useEffect, useState } from "react";
import BlockCard from "@/Components/OwnUi/BlockCard";
import { useDialogData } from '../Context/DialogDataContext';
import useDebounce from "@/Components/App/Hooks/useDebounce";
import IndividualForm from "./IndividualForm";
import Icon from "@/imports/LucideIcon";
import { Button } from "@/Components/App/Buttons/Button";
import DeleteDialog from '../../DeleteDialog/DeleteDialog';
import { format } from "date-fns";
import { es } from 'date-fns/locale';

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
    data: empleados,
    contratos,
    form,
    updateForm,
    formNewHorarios,
    updateFormNewHorarios,
    onDelete
  } = useDialogData();
  const { data, errors } = form;

  // Estado local para los inputs
  const [localData, setLocalData] = useState(data);
  const [selectedEmployee, setSelectedEmployee] = useState(empleados[0]);

  // Crear función debounced para actualizar el formulario real
  const debouncedUpdateForm = useDebounce(updateForm, 500);

  // Sincronizar el estado local cuando cambia data
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  // Función para manejar cambios en inputs con actualización inmediata de UI
  const handleChange = useCallback((id, update) => {
    // Actualizar el estado local
    setLocalData(prev =>
      prev.map(item => item.id === id ? { ...item, ...update } : item)
    );

    // Limpiar errores (si los hay por campo específico)
    Object.keys(update).forEach(key => {
      if (errors[key]) {
        delete errors[key];
      }
    });

    // Llamar a la función debounced con array parcial
    debouncedUpdateForm([{ id, ...update }]);
  }, [debouncedUpdateForm]);

  // Función para manejar cambios en inputs con actualización inmediata de UI
  // Cuando agregues un nuevo horario:
  const handleAddHorario = useCallback((fecha) => {
    const newHorario = {
      tempId: Date.now(),
      contrato_id: '',
      anexo_id: '',
      turno_id: null,
      empleado_id: selectedEmployee.id,
      fecha: fecha.date,
      modalidad_id: null,
      estado_horario_id: 2, // Pendiente
      horario_inicio: '',
      horario_fin: '',
      descanso_inicio: '',
      descanso_fin: '',
      observaciones: '',
    };

    updateFormNewHorarios([newHorario]);
  }, [selectedEmployee, updateFormNewHorarios]);

  // Edicion de nuevos horarios
  const handleChangeNewHorario = useCallback((identifier, update) => {
    updateFormNewHorarios(prev => {
      if (Array.isArray(prev)) {
        return prev.map(item =>
          (item.tempId === identifier || item.id === identifier) ? { ...item, ...update } : item
        );
      }
      return prev;
    });
  }, [updateFormNewHorarios]);

  // Eliminar nuevos horarios
  const handleDeleteNewHorario = useCallback((identifier) => {
    updateFormNewHorarios(prev => {
      if (Array.isArray(prev)) {
        const index = prev.findIndex(item => item.tempId === identifier || item.id === identifier);
        if (index > -1) {
          return [...prev.slice(0, index), ...prev.slice(index + 1)];
        }
        return prev;
      }
      return prev;
    });
  }, [updateFormNewHorarios]);

  return (
    <div className="flex flex-row gap-4">
      {/* seccion de usuarios */}
      {empleados.length > 1 &&
        <section className="flex flex-col min-w-56 overflow-y-auto dark:dark-scrollbar">
          <span className='bg-custom-gray-default dark:bg-custom-blackSemi p-2 border'>
            Empleados
          </span>
          {empleados?.map((empleado) => (
            <button
              key={empleado.empleado_id}
              onClick={() => setSelectedEmployee(empleado)}
              className={`flex flex-row items-center gap-2 p-2 text-sm hover:bg-custom-gray-default dark:hover:bg-custom-gray-semiDark ${empleado.empleado_id === selectedEmployee.empleado_id ? 'border-l-2 dark:bg-custom-blackSemi dark:border-custom-gray-semiDark' : ''}`}
            >
              <img
                src={empleado.profile_photo_url}
                alt={empleado.nombre}
                className='flex items-center justify-center h-8 w-8 rounded-full hover:bg-custom-gray-default'
              />
              <span>{empleado.nombre}</span>
            </button>
          ))}
        </section>
      }

      {/* Seccion de Horarios */}
      <section className="flex flex-row gap-4 w-full overflow-x-auto dark:dark-scrollbar">
        {selectedEmployee?.fechas?.map((fecha, index) => (
          <BlockCard title={format(new Date(fecha.date), "EEEE d 'de' MMMM", { locale: es })} className='min-w-96 min-h-[500px] !p-4'>
            <section key={index} className='flex flex-col w-full h-full items-center max-h-[620px] overflow-y-auto'>

              {/* sin horarios */}
              {(!contratos.disponibilidad?.[selectedEmployee.empleado_id]?.[fecha.date] ||
                contratos.disponibilidad?.[selectedEmployee.empleado_id]?.[fecha.date].length === 0) ? (
                <section className="flex flex-col w-48 justify-center items-center gap-2 mb-2">
                  <Icon name='AlertTriangle' size='24' />
                  <span>
                    No hay contratos
                  </span>
                </section>
              ) : (fecha.horarios.length === 0 && formNewHorarios.data.length === 0) ? (
                <section className="flex flex-row w-full justify-center items-center gap-2 mb-2">
                  <Icon name='Info' size='16' />
                  <span>
                    Aun no hay horarios
                  </span>
                </section>
              ) : null}

              {/* Nuevos horarios creados */}
              {formNewHorarios.data
                ?.filter(item =>
                  item.empleado_id === selectedEmployee.id &&
                  item.fecha === fecha.date
                )
                ?.map((horario, index) => (
                  <BlockCard key={horario.tempId || index} className="min-w-[650px] mt-4">
                    <IndividualForm
                      id={horario.tempId}
                      localData={horario}
                      errors={formNewHorarios.errors}
                      handleChange={(id, update) => handleChangeNewHorario(id, update)}
                      handleDelete={(id) => handleDeleteNewHorario(id)}
                      date={fecha.date}
                      contratos={contratos?.disponibilidad?.[selectedEmployee.empleado_id]?.[fecha.date]}
                    />
                  </BlockCard>
                ))
              }

              {/* horarios existentes */}
              {(fecha.horarios && fecha.horarios.length > 0) &&
                fecha.horarios.map((horario) => (
                  <BlockCard className="min-w-[650px] mt-4">
                    <IndividualForm
                      id={horario.horarioId}
                      localData={Array.isArray(localData) ? localData.find(item => item.id === horario.horarioId) : localData}
                      errors={errors}
                      handleChange={(id, update) => handleChange(id, update)}
                      date={fecha.date}
                    />
                  </BlockCard>
                ))
              }

              {contratos.disponibilidad?.[selectedEmployee.empleado_id]?.[fecha.date]?.length > 0 && (
                <Button className='w-fit' onClick={() => handleAddHorario(fecha)}>
                  <Icon name='Plus' size='16' className='mr-2' />
                  Añadir nuevo Horario
                </Button>
              )}
            </section>
          </BlockCard>
        ))}
      </section>
    </div>
  )
}
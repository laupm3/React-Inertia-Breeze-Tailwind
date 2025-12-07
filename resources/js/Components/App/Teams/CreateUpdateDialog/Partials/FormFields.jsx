import { useDialogData } from '../Context/DialogDataContext';
import { useCallback, useEffect, useState } from "react";
import useDebounce from "@/Components/App/Hooks/useDebounce";
import DatosDelEquipo from './DatosDelEquipo';
import PersonalizarEquipo from './PersonalizarEquipo';
import InvitarMiembros from './InvitarMiembros';
import DialogSkeleton from '../Components/DialogSkeleton';
import Table from './Table';
import Icon from '@/imports/LucideIcon';

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
    permissions,
    model,
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
    !model || permissions?.canViewTeam ? (
      <div className="flex flex-col gap-4">
        <section className='flex flex-col md:flex-row gap-4'>
          <div className={`flex w-full order-1 md:order-1 ${!model || permissions?.canUpdateTeam ? 'md:w-1/3' : 'md:w-2/3'}`}>
            <DatosDelEquipo
              errors={errors}
              localData={localData}
              handleChange={handleChange}
            />
          </div>

          <div className={`flex w-full order-2 md:order-2 ${!model || permissions?.canUpdateTeam ? 'md:w-2/3' : 'md:w-1/3'}`}>
            <PersonalizarEquipo
              errors={errors}
              localData={localData}
              handleChange={handleChange}
            />
          </div>
        </section>

        {model && (
          <>
            {permissions?.canAddTeamMembers &&
              <section>
                <InvitarMiembros
                  errors={errors}
                  localData={localData}
                  setLocalData={setLocalData}
                  handleChange={handleChange}
                />
              </section>
            }

            <section>
              <Table
                title='Miembros'
                users={localData.users}
                allowEdit
              />
            </section>

            <section>
              <Table
                title='Invitaciones'
                users={localData.teamInvitations}
              />
            </section>
          </>
        )}
      </div>
    ) : (
      <>
        <DialogSkeleton />
        <section className='absolute py-8 px-4 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-row items-center justify-center gap-2 rounded-xl bg-custom-blackLight/70'>
          <Icon name='AlertTriangle' size='16' />
          <span>Lo sentimos, no tienes permisos para ver este equipo.</span>
        </section>
      </>
    )
  )
}
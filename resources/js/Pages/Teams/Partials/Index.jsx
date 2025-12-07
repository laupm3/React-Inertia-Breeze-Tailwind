import { useState, useCallback, useEffect } from 'react'
import { useDialogData } from '@/Components/App/Teams/CreateUpdateDialog/Context/DialogDataContext';
import { Button } from '@/Components/App/Buttons/Button';
import { Separator } from "@/Components/ui/separator";
import useDebounce from "@/Components/App/Hooks/useDebounce";
import DatosDelEquipo from '@/Components/App/Teams/CreateUpdateDialog/Partials/DatosDelEquipo';
import PersonalizarEquipo from '@/Components/App/Teams/CreateUpdateDialog/Partials/PersonalizarEquipo';
import InvitarMiembros from '@/Components/App/Teams/CreateUpdateDialog/Partials/InvitarMiembros';
import Table from '@/Components/App/Teams/CreateUpdateDialog/Partials/Table';

function Index() {
  const {
    model,
    form,
    updateForm,
    handleSubmit,
    permissions
  } = useDialogData();

  const { data, errors } = form;
  const [localData, setLocalData] = useState(data);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const debouncedUpdateForm = useDebounce(updateForm, 500);

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
    <>
      <section className='flex flex-col lg:flex-row gap-4'>
        <div className='flex w-full lg:w-1/3'>
          <DatosDelEquipo
            errors={errors}
            localData={localData}
            handleChange={handleChange}
          />
        </div>

        <div className='flex w-full lg:w-2/3'>
          <PersonalizarEquipo
            errors={errors}
            localData={localData}
            handleChange={handleChange}
          />
        </div>
      </section>

      <section className='flex justify-end mt-6'>
        <Button
          type='submit'
          onClick={handleSubmit}
          className='w-full sm:w-auto'
        >
          Guardar
        </Button>
      </section>


      {model && (
        <>
          <Separator className='my-6' />

          {permissions?.canAddTeamMembers && (
            <section>
              <InvitarMiembros
                model={model}
                errors={errors}
                localData={localData}
              />
            </section>
          )}

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
    </>
  )
}

export default Index
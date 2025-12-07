import { useState, useCallback } from 'react'
import axios from 'axios'
import { useDialogData } from '../Context/DialogDataContext'
import BlockCard from '@/Components/OwnUi/BlockCard'
import { Button } from '@/Components/App/Buttons/Button'
import Icon from '@/imports/LucideIcon'
import UserSelector from './UserSelector'
import { toast } from 'sonner'

/**
 * Componente para invitar nuevos miembros al equipo.
 * 
 * Permite seleccionar usuarios y enviar invitaciones al equipo actual.
 * Se integra completamente con el sistema de formularios del contexto
 * y actualiza el estado de manera consistente.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.errors - Errores de validación del formulario
 * @param {Object} props.localData - Datos locales del formulario
 * @returns {JSX.Element} Componente de invitación de miembros
 */
function InvitarMiembros({ errors, localData }) {
  const {
    model,
    updateForm,
    permissions
  } = useDialogData();

  const [selectedUsers, setSelectedUsers] = useState([])
  const [isInviting, setIsInviting] = useState(false)

  /**
   * Maneja la invitación de nuevos miembros al equipo.
   * Realiza la petición POST y actualiza el formulario principal.
   */
  const handleAddMembers = useCallback(async () => {
    if (!selectedUsers.length) {
      toast.error('Seleccione al menos un usuario para invitar');
      return;
    }

    if (!model) {
      toast.error('Debe guardar el equipo antes de invitar miembros');
      return;
    }

    try {
      setIsInviting(true);

      const response = await axios.post(`/api/v1/teams/${model}/members`, {
        emails: selectedUsers.map(user => user.email),
        role: 'member'
      });

      // Limpiar la selección después de la invitación exitosa
      setSelectedUsers([]);

      // Actualizar el formulario principal con los nuevos datos usando el patrón establecido
      updateForm({
        teamInvitations: response.data.team.teamInvitations,
        users: response.data.team.users
      });

      toast.success(`${selectedUsers.length} miembro(s) invitado(s) correctamente`);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Error al invitar miembros';
      toast.error(errorMessage);
      console.error('Error invitando miembros:', error);
    } finally {
      setIsInviting(false);
    }
  }, [selectedUsers, model, updateForm]);

  // No mostrar el componente si no hay permisos
  if (!permissions?.canAddTeamMembers) {
    return null;
  }

  return (
    <BlockCard title='Invitar miembros al equipo'>
      <p className='text-sm opacity-80 mb-4'>
        Busque empleados por nombre o correo electrónico para invitarlos al equipo. 
        Los miembros invitados recibirán el rol de "Miembro" por defecto.
      </p>
      
      <div className='flex flex-col sm:flex-row items-start gap-4'>
        <div className='flex-1 w-full'>
          <UserSelector
            localData={localData}
            selectedUsers={selectedUsers}
            handleChange={setSelectedUsers}
          />
        </div>
        
        <Button
          variant='primary'
          size='sm'
          onClick={handleAddMembers}
          disabled={!selectedUsers.length || isInviting || !model}
          className='whitespace-nowrap w-full sm:w-auto'
        >
          {isInviting ? (
            <>
              <Icon name='Loader' size='16' className='mr-2 animate-spin' />
              Invitando...
            </>
          ) : (
            <>
              <Icon name='Plus' size='16' className='mr-2' />
              Invitar {selectedUsers.length > 0 && `(${selectedUsers.length})`}
            </>
          )}
        </Button>
      </div>
      {errors.responsable_id && <span className="text-xs text-red-500">{errors.responsable_id}</span>}
    </BlockCard>
  )
}

export default InvitarMiembros
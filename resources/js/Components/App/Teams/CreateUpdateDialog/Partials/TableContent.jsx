import { useState } from 'react'
import { useDialogData } from '../Context/DialogDataContext';
import Icon from '@/imports/LucideIcon'
import roleStyles from '../Utils/roleStyles'
import DecisionModal from '@/Components/App/Modals/DecisionModal'
import SheetTable from '@/Components/App/User/SheetTable/SheetTable'
import EditRole from './EditRole'
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/Components/ui/dropdown-menu";

export default function TableContent({ user, role, updateMembers, allowEdit }) {
  const {
    model,
    permissions
  } = useDialogData();

  const [isOpenSheetTable, setIsOpenSheetTable] = useState(false)
  const [isOpenEditRole, setIsOpenEditRole] = useState(false)
  const [isDestructiveModalOpen, setIsDestructiveModalOpen] = useState(false)

  const handleDelete = async () => {
    if (!model || !user.id) {
      toast.error('Error: Información del equipo no disponible');
      return;
    }

    try {
      await axios.delete(`/api/v1/teams/${model}/members/${user.id}`);
      toast.success('Miembro eliminado correctamente');
      updateMembers('delete', [user.id]);
      setIsDestructiveModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'No tienes permisos para eliminar miembros');
    }
  };

  return (
    <>
                    {/* Vista de escritorio */}
       <section className="hidden md:flex items-center gap-3 p-2 rounded-lg hover:bg-custom-gray-light dark:hover:bg-custom-blackLight transition-colors">
         {/* columna 1 - Nombre */}
         <div className={`flex items-center gap-2 ${allowEdit ? 'w-1/4' : 'w-3/12'} min-w-0`}>
           <img
             src={user.profile_photo_url}
             alt={user.name}
             className='w-8 h-8 rounded-full flex-shrink-0'
           />
           <span className="text-xs truncate">{user.name}</span>
         </div>
         
         {/* columna 2 - Rol */}
         <div className={`flex items-center gap-2 ${allowEdit ? 'w-1/4' : 'w-3/12'} min-w-0`}>
           {role ? (
             <div className={`flex py-1 px-2 lg:px-3 rounded-full text-xs ${roleStyles[role]} truncate`}>{role}</div>
           ) : (
             <span className='flex items-center gap-1 text-xs'>
               <Icon name='Plus' size='14' />
               <span className="hidden lg:inline">Sin rol</span>
             </span>
           )}
         </div>
         
         {/* columna 3 - Email */}
         <div className={`flex items-center gap-2 ${allowEdit ? 'w-1/4' : 'w-6/12'} min-w-0`}>
           <span className="text-xs truncate">{user.email}</span>
         </div>
         
         {/* columna 4 - Acciones */}
         {allowEdit && (
           <div className="flex items-center gap-2 w-1/4 min-w-0 justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center gap-2 p-1 hover:bg-custom-gray-default dark:hover:bg-custom-blackSemi rounded">
                  <Icon name='Ellipsis' size='16' />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="dark:bg-custom-blackSemi">
                <DropdownMenuItem onSelect={() => setIsOpenSheetTable(true)}>
                  <Icon name="Info" className="w-4 mr-2" /> Información
                </DropdownMenuItem>

                {permissions?.canUpdateTeamMembers && (
                  <DropdownMenuItem onSelect={() => setIsOpenEditRole(!isOpenEditRole)}>
                    <Icon name="UserCog" className="w-4 mr-2" /> Editar Rol
                  </DropdownMenuItem>
                )}

                {permissions?.canRemoveTeamMembers && (
                  <DropdownMenuItem
                    className="text-red-500 font-bold hover:!bg-red-500/40 hover:!text-red-500"
                    onSelect={() => setIsDestructiveModalOpen(true)}
                  >
                    <Icon name="X" className="w-4 mr-2" /> Eliminar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </section>

             {/* Vista móvil/tablet */}
       <section className="md:hidden flex flex-col gap-3 p-3 rounded-lg bg-custom-white dark:bg-custom-blackLight">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img
              src={user.profile_photo_url}
              alt={user.name}
              className='w-10 h-10 rounded-full flex-shrink-0'
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium truncate">{user.name}</span>
              <span className="text-xs text-custom-black/70 dark:text-custom-white/70 truncate">{user.email}</span>
            </div>
          </div>

          {allowEdit && (
            <div className="flex items-center justify-center h-10 ml-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center justify-center w-8 h-8 hover:bg-custom-gray-default dark:hover:bg-custom-blackSemi rounded">
                    <Icon name='Ellipsis' size='16' />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="dark:bg-custom-blackSemi">
                  <DropdownMenuItem onSelect={() => setIsOpenSheetTable(true)}>
                    <Icon name="Info" className="w-4 mr-2" /> Información
                  </DropdownMenuItem>

                  {permissions?.canUpdateTeamMembers && (
                    <DropdownMenuItem onSelect={() => setIsOpenEditRole(!isOpenEditRole)}>
                      <Icon name="UserCog" className="w-4 mr-2" /> Editar Rol
                    </DropdownMenuItem>
                  )}

                  {permissions?.canRemoveTeamMembers && (
                    <DropdownMenuItem
                      className="text-red-500 font-bold hover:!bg-red-500/40 hover:!text-red-500"
                      onSelect={() => setIsDestructiveModalOpen(true)}
                    >
                      <Icon name="X" className="w-4 mr-2" /> Eliminar
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Rol en móvil */}
        <div className="flex items-center justify-start">
          {role ? (
            <div className={`flex py-1 px-3 rounded-full text-xs ${roleStyles[role]}`}>{role}</div>
          ) : (
            <span className='flex items-center gap-2 text-xs opacity-70'>
              <Icon name='Plus' size='16' />
              Sin rol
            </span>
          )}
        </div>
      </section>

      {/* Modales */}
      {isOpenSheetTable && (
        <SheetTable
          model={user.id}
          open={isOpenSheetTable}
          onOpenChange={() => setIsOpenSheetTable(!isOpenSheetTable)}
        />
      )}

      {isOpenEditRole && (
        <EditRole
          user={user}
          open={isOpenEditRole}
          onOpenChange={() => setIsOpenEditRole(!isOpenEditRole)}
          updateMembers={updateMembers}
        />
      )}

      {isDestructiveModalOpen && (
        <DecisionModal
          title='¿Estás seguro de que quieres eliminar este miembro?'
          content='Esta acción eliminará al miembro del equipo, pero no eliminará su cuenta de usuario.'
          open={isDestructiveModalOpen}
          onOpenChange={() => setIsDestructiveModalOpen(!isDestructiveModalOpen)}
          action={handleDelete}
          variant="destructive"
          icon={<Icon name="OctagonAlert" className="w-6 h-6 text-red-500" />}
        />
      )}
    </>
  )
}
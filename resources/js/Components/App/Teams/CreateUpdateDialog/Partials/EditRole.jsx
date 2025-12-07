
import { useState } from "react";
import { useDialogData } from '../Context/DialogDataContext';
import { toast } from "sonner";
import Icon from "@/imports/LucideIcon";
import roleDefinitions from "../Utils/roleDefinitions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/Components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/Components/ui/dialog";

export default function EditRole({ user, open, onOpenChange, updateMembers }) {
  const {
    roles
  } = useDialogData();

  const [isLoading, setIsLoading] = useState(false);
  const teamId = user.membership?.team_id;

  const handleRoleUpdate = async (role) => {
    if (!teamId || !user.id) {
      toast.error('Error: Información del equipo no disponible');
      return;
    }

    setIsLoading(true);
    try {
      await axios.put(`/api/v1/teams/${teamId}/members/${user.id}`, {
        role: role
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      toast.success('Rol actualizado correctamente');
      onOpenChange();
      updateMembers('update', {
        id: user.id,
        membership: { role: role }
      })
    } catch (error) {
      console.error('Error al actualizar rol:', error.response?.data);
      toast.error(error.response?.data?.message || 'Error al actualizar el rol');
    } finally {
      setIsLoading(false);
    }
  };

  if (!teamId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-custom-gray-default dark:bg-custom-blackLight">
        <DialogHeader>
          <DialogTitle>Editar Rol - {user.name}</DialogTitle>
          <DialogDescription>
            Selecciona el rol apropiado según los permisos necesarios
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {roles.map((role) => {
            return (
              <div key={role.key} className="border rounded-lg p-4 hover:bg-custom-gray-light dark:hover:bg-custom-blackSemi cursor-pointer"
                onClick={() => !isLoading && handleRoleUpdate(role.key)}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`${roleDefinitions[role.key]?.style} px-2 py-1 text-xs font-medium rounded-full`}>
                      {role.key}
                    </span>
                    <span className="text-sm font-medium">{role.name}</span>
                  </div>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2">
                        <Icon name='Info' size='12' />
                        <span className="text-sm opacity-70 cursor-pointer">{role.description}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className='max-w-48 bg-custom-blackSemi'>
                      <div className="pl-4 bg-custom-blackSemi">
                        <ul className="list-disc text-sm text-gray-500 dark:text-gray-400">
                          {role.permissions.map((permission, index) => (
                            <li key={index}>{permission}</li>
                          ))}
                        </ul>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            );
          })}
        </div>
        {isLoading && (
          <div className="flex items-center justify-center py-2">
            <Icon name="Loader" className="w-4 h-4 animate-spin mr-2" />
            <span>Actualizando...</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
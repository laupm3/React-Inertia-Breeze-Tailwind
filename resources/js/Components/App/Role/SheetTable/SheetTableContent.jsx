import { useState, useEffect } from 'react';
import { Label } from "@/Components/ui/label";
import { Switch } from "@/Components/ui/switch";
import BlockCard from '@/Components/OwnUi/BlockCard';
import SheetTable from '@/Components/App/User/SheetTable/SheetTable';
import TextInput from "@/Components/OwnUi/TextInput";
import Icon from '@/imports/LucideIcon';
import DeleteDialog from '@/Components/App/User/DeleteDialog/DeleteDialog';

function SheetTableContent({ data, setData }) {
  const [sheetTableOpen, setSheetTableOpen] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [showPermissions, setShowPermissions] = useState([]);
  const [search, setSearch] = useState("");
  const [modules, setModules] = useState(null);

  const filteredModules = modules?.filter(module =>
    module.name.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    const fetchData = async () => {
      try {
        const modulesResponse = await axios.get(route("api.v1.admin.modules.index"));

        if (modulesResponse.status === 200) {
          setModules(modulesResponse.data.modules);
        } else {
          setError(true);
        }
      } catch (error) {
        // setError(true);
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    return () => { };
  }, [data]);

  const changePermission = async (roleId, permissionId, moduleId) => {
    try {
      const response = await axios.put(route("api.v1.admin.roles.permission.switch", { role: roleId, permission: permissionId }));
      console.log('response :>> ', response.data.roleHasPermission);

      if (response.status === 200) {
        // Actualiza data.permissions localmente
        setData(prevData => {
          const exists = prevData.permissions.some(p => p.id === permissionId);
          let newPermissions;
          if (exists) {
            newPermissions = prevData.permissions.filter(p => p.id !== permissionId);
          } else {
            // Buscar el permiso en modules
            const module = modules?.find(m => m.id === moduleId);
            const permiso = module?.permissions.find(p => p.id === permissionId);
            if (!permiso) return prevData;
            newPermissions = [...prevData.permissions, permiso];
          }
          return { ...prevData, permissions: newPermissions };
        });
        return response.data.roleHasPermission;
      }
    } catch (error) {
      console.error("Error changing permission:", error);
    }
  };

  const changeUsers = async (userId, roleId) => {
    try {
      const response = await axios.put(route("api.v1.admin.users.role.switch", { user: userId, role: roleId }));
      console.log('response :>> ', response.data);

      if (response.status === 200) {
        // Elimina el usuario de data.users si existe
        setData(prevData => {
          const exists = prevData.users.some(u => u.id === userId);
          if (!exists) return prevData;
          const newUsers = prevData.users.filter(u => u.id !== userId);
          return { ...prevData, users: newUsers };
        });
        return response.data.roleHasPermission;
      }
    } catch (error) {
      console.error("Error changing permission:", error);
    }
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (userToDelete) {
      changeUsers(userToDelete.id, data.id);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  /**
   * Department component to display department information
   * 
   * @param {Object} param0 - Props for the component
   * @returns {JSX.Element}
   */
  function Usuarios({ user }) {
    return (
      <section className="flex items-center text-custom-black dark:text-custom-white justify-between gap-4">
        <div className="flex flex-row items-center gap-2 w-full">
          <img src={user.profile_photo_url} alt={user.name} className="w-8 h-8 rounded-full" />

          <div className="flex flex-col gap-2 w-full">
            <span className="text-sm text-custom-black dark:text-custom-white opacity-70">
              {user.name}
            </span>
            <span className="text-xs text-custom-black dark:text-custom-white opacity-50">
              {user.email}
            </span>
          </div>
        </div>


        <button
          className="flex items-center gap-1 text-custom-primary dark:text-custom-primary cursor-pointer"
          onClick={() => setSheetTableOpen(user.id)}
        >
          <Icon name="ArrowUpRight" size='16' />
        </button>
        <div
          className="flex items-center gap-1 text-custom-primary dark:text-custom-primary cursor-pointer hover:text-red-400 duration-200"
          onClick={() => handleDeleteUser(user)}
        >
          <Icon name='Trash' size='16' />
        </div>
      </section>
    )
  }

  return (
    <>
      <BlockCard title='Permisos'>
        <TextInput
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-auto w-1/2"
        />

        <div className='rounded-3xl overflow-auto text-custom-black dark:text-custom-white max-h-[500px]'>
          {filteredModules &&
            filteredModules.map((module) => {
              const activePermissions = data?.permissions.filter(permission => module.permissions.some(modulePermission => modulePermission.id === permission.id)).length

              return (
                <div key={module.id} className="relative">
                  <div className='flex items-center justify-between space-y-4'>
                    <p>{module.name}</p>
                    <div className='flex items-center gap-2'>
                      <p className='text-xs font-bold text-custom-orange'>{activePermissions} / {module.permissions.length}</p>
                      <div
                        className="flex items-center w-fit p-2 mr-2 rounded-lg bg-custom-gray-default dark:bg-custom-blackSemi hover:opacity-50 duration-300 cursor-pointer select-none"
                        onClick={() => setShowPermissions(module.id === showPermissions ? null : module.id)}
                      >
                        editar permisos
                        {showPermissions === module.id ? (
                          <Icon name="ChevronUp" className="w-4 h-4 ml-2 text-custom-orange" />
                        ) : (
                          <Icon name="ChevronDown" className="w-4 h-4 ml-2" />
                        )}
                      </div>
                    </div>
                  </div>
                  {showPermissions === module.id && (
                    <div className="absolute mt-2 right-4 bg-white dark:bg-custom-blackSemi p-4 rounded-lg shadow-lg z-10">
                      {module.permissions.map((permission) => {
                        const hasThisPermission = data?.permissions?.some(rolePermission => rolePermission.id === permission.id);

                        return (
                          <div
                            key={permission.id}
                            className="flex items-center justify-between gap-2 space-y-4"
                          >
                            <Label
                              htmlFor={permission.name}
                              className="capitalize"
                            >
                              {permission.name}
                            </Label>
                            <Switch
                              id={permission.name}
                              checked={hasThisPermission}
                              className={'data-[state=checked]:bg-custom-orange'}
                              onCheckedChange={() => changePermission(data.id, permission.id, module.id)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          }
        </div>
      </BlockCard>

      <BlockCard title='Usuarios con el rol'>
        <div className="flex flex-col max-h-[500px] gap-6 px-2 pt-4 overflow-y-auto dark:dark-scrollbar">
          {data.users.map((user, index) => (
            <Usuarios key={index} user={user} />
          ))}
        </div>
      </BlockCard>

      {sheetTableOpen && (
        <SheetTable
          open={sheetTableOpen !== null}
          onOpenChange={() => setSheetTableOpen(null)}
          model={sheetTableOpen}
          enableToView={true}
        />
      )}

      {deleteDialogOpen && (
        <DeleteDialog
          open={deleteDialogOpen}
          onOpenChange={() => setDeleteDialogOpen(false)}
          model={userToDelete}
          onDelete={confirmDeleteUser}
        />
      )}
    </>
  )
}

export default SheetTableContent
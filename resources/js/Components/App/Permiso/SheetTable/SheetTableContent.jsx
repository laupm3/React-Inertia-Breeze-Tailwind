import { useState } from 'react'
import BlockCard from '@/Components/OwnUi/BlockCard';
import Icon from '@/imports/LucideIcon'
import RoleAdder from "@/Components/App/Role/RoleAdder";
import UserAdder from "@/Components/App/User/UserAdder";

function SheetTableContent({ data: initialData }) {
  const [localData, setLocalData] = useState(initialData)

  const changeRoles = async (role, permissionId) => {
    try {
      const response = await axios.put(route("api.v1.admin.roles.permission.switch", { role: role, permission: permissionId }));

      if (response.status === 200) {
        const exists = localData.roles.some(r => r.id === role.id);
        if (exists) {
          setLocalData(prevData => {
            const newRoles = prevData.roles.filter(r => r.id !== role.id);
            return { ...prevData, roles: newRoles };
          });
        } else {
          setLocalData(prevData => {
            const newRoles = [...prevData.roles, { id: role.id, name: role.name }];
            return { ...prevData, roles: newRoles };
          });
        }
      }
    } catch (error) {
      console.error("Error changing permission:", error);
    }
  };

  function Roles({ role }) {
    return (
      <section className='flex flex-row justify-between items-center'>
        <span>
          {role.name}
        </span>
      </section>
    )
  };

  const changeUsers = async (user, permissionId) => {
    try {
      const response = await axios.put(route("api.v1.admin.users.permission.switch", { user: user, permission: permissionId }));

      if (response.status === 200) {
        const exists = localData.users.some(r => r.id === user.id);
        if (exists) {
          setLocalData(prevData => {
            const newRoles = prevData.users.filter(r => r.id !== user.id);
            return { ...prevData, users: newRoles };
          });
        } else {
          setLocalData(prevData => {
            const newRoles = [...prevData.users, { id: user.id, name: user.name, email: user.email, profile_photo_url: user.profile_photo_url }];
            return { ...prevData, users: newRoles };
          });
        }
      }
    } catch (error) {
      console.error("Error changing permission:", error);
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
      <section className="flex items-center justify-between gap-4">
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
      </section>
    )
  }

  return (
    <>
      <h2 className="text-lg font-bold mb-4 text-custom-black dark:text-custom-white">
        Descripción del permiso
      </h2>
      <div className='p-4 bg-custom-gray-default dark:bg-custom-blackSemi text-custom-blackSemi dark:text-custom-gray-semiLight rounded-3xl'>
        <p>
          {localData.description}
        </p>
      </div>

      <div className='w-fit ml-auto mb-4'>
        <RoleAdder
          fetchUrl={route("api.v1.admin.roles.index")}
          onSelect={role => changeRoles(role, localData.id)}
          prevRoles={localData.roles}
        />
      </div>

      <BlockCard title='Roles con el permiso'>
        <div className='flex flex-col max-h-[500px] gap-3 text-custom-black dark:text-custom-white'>
          {localData.roles?.length === 0 || !localData.roles ? (
            <span className='flex items-center text-custom-black/60 gap-2'>
              <Icon name='AlertTriangle' size='16' />
              No hay roles con este permiso
            </span>
          ) : (
            localData.roles.map((role) => (
              <div key={role.id} className='flex flex-row justify-between items-center'>
                <Roles
                  key={role.id}
                  role={role}
                />
                <button
                  className='cursor-pointer hover:text-custom-orange duration-300'
                  onClick={() => changeRoles(role, localData.id)}
                >
                  <Icon
                    name='Trash'
                    size='16'
                  />
                </button>
              </div>
            ))
          )}
        </div>
      </BlockCard>

      <div className='w-fit ml-auto mb-4'>
        <UserAdder
          fetchUrl={route("api.v1.admin.users.index")}
          onSelect={user => changeUsers(user, localData.id)}
          prevUsers={localData?.users}
        />
      </div>

      <BlockCard title='Usuarios con el permiso'>
        <div className="flex flex-col max-h-[500px] gap-6 px-2 pt-4 overflow-y-auto dark:dark-scrollbar">
          {localData.users?.length === 0 || !localData.users ? (
            <span className='flex items-center text-custom-black/60 gap-2'>
              <Icon name='AlertTriangle' size='16' />
              No hay usuarios con este permiso
            </span>
          ) : (
            localData.users?.map((user) => (
              <div key={user.id} className='flex flex-row justify-between items-center'>
                <Usuarios
                  key={user.id}
                  user={user}
                />
                <button
                  className='cursor-pointer hover:text-custom-orange duration-300'
                  onClick={() => changeUsers(user, localData.id)}
                >
                  <Icon
                    name='Trash'
                    size='16'
                  />
                </button>
              </div>
            ))
          )}
        </div>
      </BlockCard>
    </>
  )
}

export default SheetTableContent

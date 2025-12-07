import { useState, useEffect, useCallback } from 'react'
import { useDialogData } from '../Context/DialogDataContext';
import BlockCard from '@/Components/OwnUi/BlockCard'
import Icon from '@/imports/LucideIcon'
import TableContent from './TableContent'

function Header({ allowEdit }) {
  const {
    permissions,
  } = useDialogData();

  return (
    <div className="hidden sm:flex items-center justify-between px-4 py-2 rounded-t-3xl text-custom-black dark:text-custom-white bg-custom-gray-default dark:bg-custom-blackSemi">
      <div className="w-1/4 min-w-0">
        <span className="text-sm font-semibold">Nombre</span>
      </div>
      <div className="w-1/4 min-w-0 hidden md:block">
        <span className="text-sm font-semibold">Rol</span>
      </div>
      <div className={`${allowEdit ? 'w-1/4 md:w-1/4' : 'w-2/4 md:w-2/4'} min-w-0`}>
        <span className="text-sm font-semibold">Email</span>
      </div>
      {allowEdit && (
        <div className="w-1/4 min-w-0 flex justify-center">
          <span className="text-sm font-semibold">Acciones</span>
        </div>
      )}
    </div>
  )
}

function Table({ title, users, allowEdit }) {
  const [localUsers, setLocalUsers] = useState([])

  useEffect(() => {
    setLocalUsers(users)
  }, [users])

  const updateMembers = useCallback((action, data) => {
    setLocalUsers(prev => {
      switch (action) {
        case 'update':
          return prev.map(u =>
            u.user?.id === data.id || u.id === data.id
              ? { ...u, ...data }
              : u
          )
        case 'delete':
          return prev.filter(u => !(data.includes(u.id) || data.includes(u.user?.id)))
        case 'add':
          return [...prev, ...data]
        default:
          return prev
      }
    })
  }, [])

  return (
    <BlockCard title={title}>
      {localUsers.length > 0 ? (
        <>
          <Header allowEdit={allowEdit} />

          <div className="flex flex-col gap-2 sm:gap-4 px-2 sm:px-4 max-h-[350px] overflow-y-auto">
            {localUsers.map((user, index) => (
              <TableContent
                key={index}
                user={user.user || user}
                role={user.membership?.role || user.role}
                updateMembers={updateMembers}
                allowEdit={allowEdit}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2 p-4">
          <Icon name='AlertTriangle' size='16' />
          <span className="text-sm text-custom-black dark:text-custom-white opacity-70">No hay {title.toLowerCase()}</span>
        </div>
      )}
    </BlockCard>
  )
}

export default Table
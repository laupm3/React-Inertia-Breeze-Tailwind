import { useState, startTransition, Suspense } from 'react'
import BlockCard from '@/Components/OwnUi/BlockCard';
import Skeleton from './Skeleton';
import IndividualSection from './IndividualSection';
import EmpleadosDialog from './EmpleadosDialog';
import Icon from '@/imports/LucideIcon';

function UsuariosActivos({ data }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState({ data: [], title: '' });

  const maxUsers = 20;

  const dinamicTitle = ({ title, icon }) => (
    <div className='flex items-center'>
      <div className='flex items-center justify-center p-1 text-custom-orange bg-custom-orange/20 rounded-md mr-1'>
        <Icon name={icon} size='16' />
      </div>
      <span>{title}</span>
    </div>
  );

  const handleOpenDialog = (data, title) => {
    startTransition(() => {
      setDialogData({ data, title });
      setDialogOpen(true);
    });
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setDialogData({ data: [], title: '' });
  };

  return (
    <>
      <BlockCard
        title='Empleados'
        className="h-full"
      >
        {data ? (
          <section className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
            <IndividualSection
              title={dinamicTitle({ title: 'Trabajando', icon: 'Briefcase' })}
              data={data?.working?.employees}
              onOpenDialog={handleOpenDialog}
              maxUsers={maxUsers}
            />

            <IndividualSection
              title={dinamicTitle({ title: 'Teletrabajando', icon: 'Laptop' })}
              data={data?.remote?.employees}
              onOpenDialog={handleOpenDialog}
              maxUsers={maxUsers}
            />

            <IndividualSection
              title={dinamicTitle({ title: 'Descansando', icon: 'Coffee' })}
              data={data?.on_break?.employees}
              onOpenDialog={handleOpenDialog}
              maxUsers={maxUsers}
            />

            <IndividualSection
              title={dinamicTitle({ title: 'Ausencias', icon: 'Ghost' })}
              data={data?.on_leave?.employees}
              onOpenDialog={handleOpenDialog}
              maxUsers={maxUsers}
            />

            <IndividualSection
              title={dinamicTitle({ title: 'Retrasos', icon: 'History' })}
              data={data?.late?.employees}
              onOpenDialog={handleOpenDialog}
              maxUsers={maxUsers}
            />

            <IndividualSection
              title={dinamicTitle({ title: 'No trabajando', icon: 'SquareDashed' })}
              data={data?.not_working?.employees}
              onOpenDialog={handleOpenDialog}
              maxUsers={maxUsers}
            />
          </section>
        ) : (
          <Skeleton />
        )}
      </BlockCard>

      {/* dialog */}
      {dialogOpen && (
        <Suspense fallback={<div>Cargando datos...</div>}>
          <EmpleadosDialog
            open={dialogOpen}
            onOpenChange={handleCloseDialog}
            data={dialogData.data}
            title={dialogData.title}
          />
        </Suspense>
      )}
    </>
  )
}

export default UsuariosActivos

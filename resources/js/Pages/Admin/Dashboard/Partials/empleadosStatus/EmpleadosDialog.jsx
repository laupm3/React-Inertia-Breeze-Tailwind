import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import DataTable from './dataTable/Index';

function EmpleadosDialog({ open, onOpenChange, data, title }) {

  const empleadoCard = (row) => (
    <span className='flex flex-row items-center gap-4 bg-custom-gray-default dark:bg-custom-blackSemi px-4 py-2 rounded-2xl'>
      <div className='w-10 h-10 rounded-full overflow-hidden'>
        <img src={row.profile_photo_url} alt={row.full_name} />
      </div>

      <span className='flex flex-col gap-1'>
        <span className='text-sm'>
          {row.full_name}
        </span>
        <span className='text-xs text-muted-foreground'>
          {row.job_position || 'Sin puesto'}
        </span>
      </span>
    </span>
  )

  const filter = (row) => {
    return row.full_name
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
      >
        <DialogDescription className='hidden'>
          Empleados
        </DialogDescription>


        <DialogContent
          className=' bg-custom-white dark:bg-custom-blackLight dark:dark-scrollbar max-h-screen '
        >
          <DialogHeader>
            <DialogTitle className='flex flex-row items-end gap-2'>
              {title}
              <span className='text-sm text-custom-orange/70'>{data.length}</span>
            </DialogTitle>
          </DialogHeader>

          {/* DataTable */}
          <DataTable data={data} content={empleadoCard} filter={filter} />

        </DialogContent>
      </Dialog>
    </>
  )
}

export default EmpleadosDialog


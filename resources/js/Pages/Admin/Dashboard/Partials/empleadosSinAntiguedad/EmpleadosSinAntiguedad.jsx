import BlockCard from '@/Components/OwnUi/BlockCard';
import Skeleton from './Skeleton';
import DataTable from '../empleadosStatus/dataTable/Index';
import { ChartRadialShape } from './Chart';

function EmpleadosSinAntiguedad({ data }) {

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
          {row.department_name}
        </span>
      </span>
    </span>
  )

  const filter = (row) => {
    return `${row.full_name} ${row.department_name}`
  }

  return (
    <BlockCard title='Empleados sin antigüedad' className2="h-full">
      {data && data.new_employees_list && data.new_employee_count ? (
        <div className="flex flex-col h-full gap-4">
          <ChartRadialShape data={data.new_employee_count} />

          <div className='flex flex-col w-full h-full max-h-[600px] gap-4'>
            <DataTable data={data.new_employees_list} content={empleadoCard} filter={filter} />
          </div>

          <span className="text-sm text-muted-foreground mt-auto">
            Empleados que no tienen antigüedad
          </span>
        </div>
      ) : (
        <Skeleton />
      )}
    </BlockCard>
  )
}

export default EmpleadosSinAntiguedad
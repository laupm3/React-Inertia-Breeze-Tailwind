import BlockCard from '@/Components/OwnUi/BlockCard';
import Skeleton from './Skeleton';
import { ChartBarMixed } from './Chart';
import DataTable from '../empleadosStatus/dataTable/Index';
import Icon from '@/imports/LucideIcon';
import { format } from "date-fns";
import { es } from "date-fns/locale";

function FinalizacionContratos({ data, date }) {

  const empleadoCard = (row) => {
    // Verificamos si la fecha de finalización y los días restantes son válidos.
    const hasValidDate = row.fecha_fin && row.dias_restantes !== null;

    return (
      <span className='flex flex-col w-full gap-4 bg-custom-gray-default dark:bg-custom-blackSemi rounded-xl p-4'>
        <div className='flex flex-row w-full items-center gap-2'>
          <img
            src={row.empleado?.profile_photo_url}
            alt={row.empleado?.full_name}
            className="w-8 h-8 rounded-full"
          />
          <span className='text-xs'>{row.empleado?.full_name}</span>
          {hasValidDate && (
            <span className='flex flex-row gap-1 text-xs text-custom-orange ml-auto bg-custom-orange/20 rounded-full px-2 py-1'>
              <Icon name="Calendar" size='16' />
              {format(new Date(row.fecha_fin), "dd MMM yyyy", { locale: es })}
            </span>
          )}
        </div>
        <div className='flex flex-col gap-2'>
          {hasValidDate ? (
            <>
              <span className='text-sm'>
                Finalizará su contrato de <span className='font-bold'>{row.department_name}</span> el {format(new Date(row.fecha_fin), "d 'de' MMMM 'de' yyyy", { locale: es })}. Quedan {Math.floor(row.dias_restantes)} días.
              </span>
            </>
          ) : (
            <span className='text-sm text-muted-foreground'>
              Este contrato no tiene fecha de finalización.
            </span>
          )}
        </div>
      </span>
    )
  }

  const filter = (row) => {
    return `${row.empleado.full_name} ${row.department_name}`
  }

  return (
    <>
      <section className='flex w-full'>
        <BlockCard title='Finalización de Contratos' className="h-full">
          {data && data.expiring_soon_list && data.expiring_in_days_counts ? (
            <section className='flex flex-col lg:flex-row h-full justify-between gap-8'>
              <div className='flex flex-col w-full h-full justify-start gap-4'>
                <span className="text-sm text-muted-foreground">
                  {date}
                </span>

                <ChartBarMixed data={data.expiring_in_days_counts} text='Usuarios' />
              </div>

              <div className='flex flex-col w-full h-full gap-4'>
                <DataTable data={data.expiring_soon_list} content={empleadoCard} filter={filter} />
              </div>
            </section>
          ) : (
            <Skeleton />
          )}
        </BlockCard>
      </section>
    </>
  )
}

export default FinalizacionContratos
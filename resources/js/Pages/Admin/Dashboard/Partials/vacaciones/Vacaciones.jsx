import BlockCard from '@/Components/OwnUi/BlockCard';
import Skeleton from './Skeleton';
import { ChartLineDots } from './Chart';

function Vacaciones({ data, date }) {

  return (
    <BlockCard title='Vacaciones' className="h-full">
      {data && data.weekly_stats ? (
        <div className="flex flex-col h-full justify-between gap-4">
          <span className="text-muted-foreground">
            {date}
          </span>

          <ChartLineDots data={data.weekly_stats} text='Usuarios' />

          <span className="text-sm text-muted-foreground">
            Solicitudes de vacaciones pendientes de revisar
          </span>
        </div>
      ) : (
        <Skeleton />
      )}
    </BlockCard>
  )
}

export default Vacaciones
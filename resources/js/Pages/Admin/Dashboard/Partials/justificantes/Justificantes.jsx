import BlockCard from '@/Components/OwnUi/BlockCard';
import Skeleton from './Skeleton';
import { ChartBarDefault } from './Chart';

function Justificantes({ data }) {

  return (
    <BlockCard title='Justificantes' className="h-full">
      {data && data.weekly_stats ? (
        <div className="flex flex-col h-full justify-between gap-4">

          <ChartBarDefault data={data.weekly_stats} />

          <span className="text-sm text-muted-foreground">
            Justificantes pendientes de revisión
          </span>
        </div>
      ) : (
        <Skeleton />
      )}
    </BlockCard>
  )
}

export default Justificantes
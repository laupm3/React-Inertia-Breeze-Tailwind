import BlockCard from '@/Components/OwnUi/BlockCard';
import Skeleton from './Skeleton';
import { ChartLineMultiple } from './Chart';

function Fichajes({ data, date }) {

  return (
    <BlockCard title='Fichajes' className="h-full">
      {data && data.by_hour ? (
        <div className="flex flex-col h-full justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            {date}
          </span>

          <ChartLineMultiple data={data.by_hour} text='Usuarios' />

          <span className="text-sm text-muted-foreground">
            Ficahajes iniciados por dispositivo
          </span>
        </div>
      ) : (
        <Skeleton />
      )}
    </BlockCard>
  )
}

export default Fichajes
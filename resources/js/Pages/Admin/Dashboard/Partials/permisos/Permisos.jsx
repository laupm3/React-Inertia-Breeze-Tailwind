import BlockCard from '@/Components/OwnUi/BlockCard';
import Skeleton from './Skeleton';
import { ChartPieInteractive } from './Chart';

function Permisos({ data, date }) {

  return (
    <BlockCard title='Permisos' className="h-full">
      {data && data.breakdown ? (
        <div className="flex flex-col h-full justify-between gap-4">
          <ChartPieInteractive data={data.breakdown} text={date} />
        </div>
      ) : (
        <Skeleton />
      )}
    </BlockCard>
  )
}

export default Permisos
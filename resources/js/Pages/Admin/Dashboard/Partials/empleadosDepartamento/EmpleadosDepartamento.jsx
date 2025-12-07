import BlockCard from '@/Components/OwnUi/BlockCard';
import Skeleton from './Skeleton';
import { ChartPieInteractive } from './Chart';

function EmpleadosDepartamento({ data, date }) {

  return (
    <BlockCard title='Empleados por Departamento' className="h-full">
      {data && data.stats ? (
        <div className="flex flex-col h-full justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            {date}
          </span>

          <ChartPieInteractive data={data.stats} />

          <span className="text-sm text-muted-foreground">
            Cantidad de empleados totales: {data.stats.length}
          </span>
        </div>
      ) : (
        <Skeleton />
      )}
    </BlockCard>
  )
}

export default EmpleadosDepartamento
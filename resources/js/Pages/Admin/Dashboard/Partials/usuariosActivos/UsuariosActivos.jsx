import BlockCard from '@/Components/OwnUi/BlockCard';
import Skeleton from './Skeleton';
import { ChartRadialShape } from './Chart';

function UsuariosActivos({ data, date }) {
  // Comprobamos si tenemos los datos necesarios para renderizar
  const hasData = data && typeof data.total_users_count !== 'undefined';
  const connected = data?.connected_count ?? 0;
  const total = data?.total_users_count ?? 0;

  return (
    <BlockCard title='Usuarios Activos' className="h-full">
      {hasData ? (
        <div className="flex flex-col h-full justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            {date}
          </span>

          {/* Pasamos ambos valores al componente del gráfico */}
          <ChartRadialShape data={{ connected_count: connected, total_users_count: total }} />

          {/* Mostramos el nuevo texto descriptivo */}
          <span className="text-sm text-muted-foreground text-center font-medium">
            {`${connected} de ${total} usuarios están conectados`}
          </span>
        </div>
      ) : (
        <Skeleton />
      )}
    </BlockCard>
  )
}

export default UsuariosActivos
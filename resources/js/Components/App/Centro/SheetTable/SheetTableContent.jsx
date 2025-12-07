import BlockCard from '@/Components/OwnUi/BlockCard';
import STATUS_CENTRO_COLOR_MAP from '../../Pills/constants/StatusCentroMapColor';
import Pill from '../../Pills/Pill';
import Maps from "@/Components/MapApi/Maps";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import Icon from "@/imports/LucideIcon";

function SheetTableContent({ data }) {

  /**
   * Section component to display a title and value pair - Responsive version
   * 
   * @param {string} title - The title of the section
   * @param {string|JSX.Element} value - The value of the section
   * @returns {JSX.Element}
   */
  function Section({ title, value }) {
    return (
      <section className="flex flex-col sm:flex-row border-b border-custom-gray-default dark:border-custom-blackSemi last:border-b-0">
        <div className='flex items-center py-3 px-4 sm:w-40 md:w-48 bg-custom-gray-default dark:bg-custom-blackSemi'>
          <span className="text-sm text-custom-black dark:text-custom-white font-semibold">{title}</span>
        </div>

        <div className="flex-1 py-3 px-4">
          <span className="text-sm text-custom-black dark:text-custom-white opacity-70">{value}</span>
        </div>
      </section>
    )
  }

  /**
   * Department component to display department information - Responsive version
   * 
   * @param {Object} param0 - Props for the component
   * @returns {JSX.Element}
   */
  function Department({ department }) {
    return (
      <section className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-custom-gray-semiLight dark:border-custom-gray-semiDark last:border-b-0">
        <div className="flex-1 sm:w-1/3">
          <span className="block text-xs text-custom-gray-semiDark dark:text-custom-gray-dark sm:hidden">Departamento</span>
          <span className="text-sm text-custom-black dark:text-custom-white font-medium">{department.nombre}</span>
        </div>
        <div className="flex-1 sm:w-1/3 sm:text-center">
          <span className="text-sm text-custom-black dark:text-custom-white opacity-70">
            {department.contratosVigentes.length} Usuarios
          </span>
        </div>
        <div className="flex items-center gap-2 flex-1 sm:w-1/3">
          <span className="block text-xs text-custom-gray-semiDark dark:text-custom-gray-dark sm:hidden">Manager:</span>
          <img 
            src={department.manager.user.profile_photo_url} 
            alt={department.manager.user.name} 
            className="w-8 h-8 rounded-full flex-shrink-0" 
          />
          <span className="text-sm text-custom-black dark:text-custom-white opacity-70 truncate">
            {department.manager.nombreCompleto}
          </span>
        </div>
      </section>
    )
  }

  const CentroInfo = ({ center }) => (
    <div className="bg-custom-white dark:bg-custom-blackLight border border-custom-gray-semiLight dark:border-custom-gray-semiDark space-y-3 p-4 m-4 rounded-xl">
      <div className="flex items-start gap-2">
        <Icon name="MapPin" className="w-4 h-4 mt-0.5 flex-shrink-0 text-custom-blue dark:text-custom-orange" />
        <h1 className="font-bold text-base text-custom-black dark:text-custom-white">{center.nombre}</h1>
      </div>
      <div className="flex items-start gap-2">
        <Icon name="Map" className="w-4 h-4 mt-0.5 flex-shrink-0 text-custom-blue dark:text-custom-orange" />
        <p className="text-sm text-custom-black dark:text-custom-white opacity-80 leading-relaxed">
          {center.direccion.full_address}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Icon name="Phone" className="w-4 h-4 flex-shrink-0 text-custom-blue dark:text-custom-orange" />
        <p className="text-sm text-custom-black dark:text-custom-white opacity-80">{center.telefono}</p>
      </div>
      <div className="flex items-center gap-2">
        <Icon name="Activity" className="w-4 h-4 flex-shrink-0 text-custom-blue dark:text-custom-orange" />
        <Pill
          identifier={center.estado.nombre}
          children={center.estado.nombre}
          mapColor={STATUS_CENTRO_COLOR_MAP}
          size="text-xs"
          textClassName="font-medium"
        />
      </div>
    </div>
  );

  const MapDialog = ({ centro }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="rounded-full bg-custom-gray-default dark:bg-custom-blackSemi hover:bg-custom-gray-semiLight dark:hover:bg-custom-gray-semiDark transition-colors"
        >
          <Icon name="MapPin" className="w-4 h-4 mr-2" /> 
          <span>Ver en mapa</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] w-full sm:max-w-[1025px] h-[90vh] sm:h-[625px] bg-custom-white dark:bg-custom-blackLight p-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
          {/* Mapa */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="rounded-xl overflow-hidden max-w-full h-[500px] sm:h-fit sm:min-h-[300px] sm:max-h-[550px]">
              <Maps
                centers={[centro]}
                center={{ lat: centro.direccion.latitud, lng: centro.direccion.longitud }}
                zoom={15}
              />
            </div>
          </div>
          
          {/* Información */}
          <div className="lg:col-span-1 order-1 lg:order-2 overflow-auto">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-lg font-semibold text-custom-blue dark:text-custom-white">
                Información del Centro
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-auto">
              <CentroInfo center={centro} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {/* Información Principal */}
      <BlockCard title='Información'>
        <div className='rounded-3xl overflow-auto border-4 border-custom-gray-default dark:border-custom-blackSemi'>
          <Section title="Nombre" value={data.nombre} />
          <Section title="Empresa" value={data.empresa?.nombre} />
          <Section title="Responsable" value={data.responsable.nombreCompleto} />
          <Section title="Coordinador" value={data.coordinador.nombreCompleto} />
          <Section title="Estado" value={
            <Pill
              identifier={data.estado.nombre}
              children={data.estado.nombre}
              mapColor={STATUS_CENTRO_COLOR_MAP}
              size="text-xs"
              textClassName="font-medium"
            />
          } />
          <Section title="Dirección" value={
            <span className="break-words">{data.direccion.full_address}</span>
          } />
          <Section title="Teléfono" value={data.telefono} />
          <Section title="Email" value={
            <span className="break-all">{data.email}</span>
          } />
        </div>
      </BlockCard>

      {/* Departamentos */}
      <BlockCard title={`Departamentos (${data.departamentos.length})`}>
        {data.departamentos.length > 0 ? (
          <div className="rounded-xl overflow-hidden border border-custom-gray-default dark:border-custom-blackSemi">
            {/* Header - Solo visible en desktop */}
            <div className="hidden sm:flex items-center px-4 py-3 text-custom-black dark:text-custom-white bg-custom-gray-default dark:bg-custom-blackSemi">
              <div className="w-1/3">
                <span className="text-sm font-semibold">Departamento</span>
              </div>
              <div className="w-1/3 text-center">
                <span className="text-sm font-semibold">Usuarios</span>
              </div>
              <div className="w-1/3">
                <span className="text-sm font-semibold">Manager</span>
              </div>
            </div>

            {/* Lista de departamentos */}
            <div className="divide-y divide-custom-gray-semiLight dark:divide-custom-gray-semiDark">
              {data.departamentos.map((department, index) => (
                <Department key={department.id || index} department={department} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-4 text-custom-gray-semiDark dark:text-custom-gray-dark">
            <Icon name='AlertTriangle' size='16' />
            <span className="text-sm">No hay departamentos asignados</span>
          </div>
        )}
      </BlockCard>

      {/* Botón de Mapa */}
      <div className="flex justify-center pt-4">
        <MapDialog centro={data} />
      </div>
    </div>
  )
}

export default SheetTableContent
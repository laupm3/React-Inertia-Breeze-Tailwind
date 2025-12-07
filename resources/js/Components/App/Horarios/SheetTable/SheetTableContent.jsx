import { useState } from 'react';
import Icon from '@/imports/LucideIcon';
import { Button } from '@/Components/App/Buttons/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import SheetTableHeader from "@/Components/App/Empleado/SheetTable/SheetTableHeader.jsx";
import Pill from "@/Components/App/Pills/Pill";
import { TableCell } from "./Components/TableCell";
import { GridCell } from "./Components/GridCell";
import STATUS_HORARIO_COLOR_MAP from '@/Components/App/Pills/constants/StatusHorarioMapColor.jsx';
import STATUS_EMPLEADO_COLOR_MAP from "@/Components/App/Pills/constants/StatusEmpleadoMapColor";
import ContratosVigentesDialog from "@/Components/App/Empleado/ContratosVigentesDialog/ContratosVigentesDialog";

function SheetTableContent({ data }) {

  function openMapInNewTab(latitud, longitud) {
    const url = `https://www.google.com/maps?q=${latitud},${longitud}`;
    window.open(url, '_blank');
  }

  function formatDate(dateString) {
    return new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(new Date(dateString))
  }

  const Tab1 = ({ data }) => {

    const fields = [
      { label: 'Empresa', value: data.contrato.empresa?.nombre || ' ' },
      { label: 'Centro', value: data.centro?.nombre || ' ' },
      { label: 'Turno', value: data.turno?.nombre || ' ' },
      { label: 'Modalidad', value: data.modalidad?.name || ' ' },
      {
        label: 'Estado del horario', value: (
          <Pill
            identifier={data.estadoHorario.name}
            children={data.estadoHorario.name}
            mapColor={STATUS_HORARIO_COLOR_MAP}
            size="text-xs"
            textClassName="font-medium"
          />
        )
      },
      { label: 'Hora inicio', value: data.turno?.horaInicio || ' ' },
      { label: 'Hora fin', value: data.turno?.horaFin || ' ' },
      { label: 'Descanso inicio', value: data.turno?.descansoInicio || ' ' },
      { label: 'Descanso fin', value: data.turno?.descansoFin || ' ' },
      ...(data.hora_inicio && data.hora_fin) ? [
        { label: 'Fichaje completado inicio', value: data.hora_inicio || ' ' },
        { label: 'Fichaje completado fin', value: data.hora_fin || ' ' },
        { label: 'Descanso completado inicio', value: data.descansoInicio || ' ' },
        { label: 'Descanso completado fin', value: data.descansoFin || ' ' },
        {
          label: 'Coordenadas de entrada',
          value: (
            data.latitud_entrada && data.longitud_entrada ? (
              <div className='flex gap-4 items-center'>
                {`${data.latitud_entrada}, ${data.longitud_entrada}` || ' '}
                <Button variant='secondary' size='icon' onClick={() => openMapInNewTab(data.latitud_entrada, data.longitud_entrada)}>
                  <Icon name='ArrowUpRight' size='16' />
                </Button>
              </div>
            ) : ' '
          )
        },
        {
          label: 'Coordenadas de salida',
          value: (
            data.latitud_salida && data.longitud_salida ? (
              <div className='flex gap-4 items-center'>
                {`${data.latitud_salida}, ${data.longitud_salida}` || ' '}
                <Button variant='secondary' size='icon' onClick={() => openMapInNewTab(data.latitud_salida, data.longitud_salida)}>
                  <Icon name='ArrowUpRight' size='16' />
                </Button>
              </div>
            ) : ' '
          )
        },
        { label: 'IP entrada', value: data.ip_address_entrada || ' ' },
        { label: 'IP salida', value: data.ip_address_salida || ' ' },
        { label: 'Dispositivo de entrada', value: data.user_agent_entrada || ' ' },
        { label: 'Dispositivo de salida', value: data.user_agent_salida || ' ' },
        { label: 'Observaciones', value: data.observaciones || ' ' },
      ] : []

    ];

    return (
      <>
        <div className="block sm:hidden space-y-2">
          {fields.map((field, index, array) => (
            <TableCell
              key={field.label}
              label={field.label}
              value={field.value}
              isFirst={index === 0}
              isLast={index === array.length - 1}
            />
          ))}
        </div>
        <div className="hidden sm:grid sm:grid-cols-2 overflow-hidden rounded-[20px]">
          {fields.map((field, index) => (
            <GridCell
              key={field.label}
              label={field.label}
              value={field.value}
              isHeader={index === 0}
              isLast={index === fields.length - 1}
            />
          ))}
        </div>
      </>
    );
  };

  const Tab2 = ({ data }) => {
    const [isOpenContratosDialog, setIsOpenContratosDialog] = useState(false);

    const fields = [
      { label: 'Nombre', value: data.empleado?.nombre || ' ' },
      { label: 'Primer apellido', value: data.empleado?.primerApellido || ' ' },
      { label: 'Segundo apellido', value: data.empleado?.segundoApellido || ' ' },
      { label: 'NIF', value: data.empleado?.nif || ' ' },
      { label: 'Id', value: data.empleado?.id || ' ' },
      {
        label: 'Estado', value: (
          <Pill
            identifier={data.empleado?.estadoEmpleado?.nombre}
            mapColor={STATUS_EMPLEADO_COLOR_MAP}
          >
            {data.empleado?.estadoEmpleado?.nombre || ''}
          </Pill>
        )
      },
      { label: 'Direccion', value: data.empleado?.direccion?.full_address || ' ' },
      { label: 'Email', value: data.empleado?.email || ' ' },
      { label: 'Email secundario', value: data.empleado?.emailSecundario || ' ' },
      { label: 'Telefono', value: data.empleado?.telefono || ' ' },
      { label: 'Telefono de emergencia', value: data.empleado?.telefonoEmergencia || ' ' },
      {
        label: 'Contrato',
        value: (
          <>
            <button
              onClick={() => setIsOpenContratosDialog(true)}
              className="flex items-center gap-2 text-custom-gray-semiDark hover:text-custom-gray-dark dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              <span className="text-sm font-medium">Contratos vigentes</span>
              <Icon name="ArrowUpRight" size="16" />
            </button>
            {isOpenContratosDialog && (
              <ContratosVigentesDialog
                model={data.empleado.id}
                open={isOpenContratosDialog}
                onOpenChange={setIsOpenContratosDialog}
              //row={{ original: data.empleado }}
              />
            )}
          </>
        )
      },
    ];

    return (
      <>
        <div className="block sm:hidden space-y-2">
          {fields.map((field, index, array) => (
            <TableCell
              key={field.label}
              label={field.label}
              value={field.value}
              isFirst={index === 0}
              isLast={index === array.length - 1}
            />
          ))}
        </div>
        <div className="hidden sm:grid sm:grid-cols-2 overflow-hidden rounded-[20px]">
          {fields.map((field, index) => (
            <GridCell
              key={field.label}
              label={field.label}
              value={field.value}
              isHeader={index === 0}
              isLast={index === fields.length - 1}
            />
          ))}
        </div>
      </>
    );
  };

  return (
    <>
      {/* cabecera del usuario en caso de haber usuario accesible */}
      {data?.empleado?.user && (
        <SheetTableHeader data={data?.empleado?.user} />
      )}

      <Tabs defaultValue="tab1" className="w-full mt-6">
        <TabsList className="w-full h-12 grid grid-cols-2 bg-custom-gray-default/50 dark:bg-custom-gray-darker/50 rounded-lg">
          <TabsTrigger
            value="tab1"
            className="h-full px-3 text-sm font-medium transition-all text-custom-gray-dark data-[state=active]:text-custom-gray-semiDark data-[state=active]:bg-white dark:text-gray-300 dark:data-[state=active]:bg-custom-gray-sidebar dark:data-[state=active]:text-white rounded-lg"
          >
            <span className="whitespace-nowrap">
              Información personal
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="tab2"
            className="h-full px-3 text-sm font-medium transition-all text-custom-gray-dark data-[state=active]:text-custom-gray-semiDark data-[state=active]:bg-white dark:text-gray-300 dark:data-[state=active]:bg-custom-gray-sidebar dark:data-[state=active]:text-white rounded-lg"
          >
            <span className="whitespace-nowrap">
              Información laboral
            </span>
          </TabsTrigger>
        </TabsList>
        <TabsContent className="mt-4 w-full" value="tab1">
          <Tab1 data={data} />
        </TabsContent>
        <TabsContent className="mt-4 w-full" value="tab2">
          <Tab2 data={data} />
        </TabsContent>
      </Tabs>
    </>
  )
}

export default SheetTableContent
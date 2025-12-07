import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import SheetTableHeader from "./SheetTableHeader";
import Icon from "@/imports/LucideIcon";
import Pill from '@/Components/App/Pills/Pill';
import STATUS_EMPLEADO_COLOR_MAP from "@/Components/App/Pills/constants/StatusEmpleadoMapColor";
import { TableCell } from "./Components/TableCell";
import { GridCell } from "./Components/GridCell";
import ContratosVigentesDialog from "@/Components/App/Empleado/ContratosVigentesDialog/ContratosVigentesDialog";

const Tab1 = ({ data }) => {

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = `0${date.getDate()}`.slice(-2);
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  const personalFields = [
    { label: 'Asignación', value: data.asignacion?.nombre || 'N/A' },
    { label: 'Tipo de contrato', value: data.tipoContrato?.nombre || 'N/A' },
    { label: 'Centro', value: data.centro?.nombre || 'N/A' },
    { label: 'Departamento', value: data.departamento?.nombre || 'N/A' },
    { label: 'Empresa', value: data.empresa?.nombre || 'N/A' },
    { label: 'Numero expediente', value: data.n_expediente || 'N/A' },
    { label: 'Fecha de inicio', value: formatDate(data.fechaInicio) },
    { label: 'Fecha de fin', value: formatDate(data.fechaFin) },
  ];

  // Versión móvil
  const MobileView = () => (
    <div className="block md:hidden space-y-0">
      {personalFields.map((field, index, array) => (
        <TableCell
          key={field.label}
          label={field.label}
          value={field.value}
          isFirst={index === 0}
          isLast={index === array.length - 1}
        />
      ))}
    </div>
  );

  // Versión desktop y tablet
  const DesktopView = () => (
    <div className="hidden md:grid md:grid-cols-2 overflow-hidden rounded-[20px]">
      {personalFields.map((field, index) => (
        <GridCell
          key={field.label}
          label={field.label}
          value={field.value}
          isHeader={index === 0}
          isLast={index === personalFields.length - 1}
        />
      ))}
    </div>
  );

  return (
    <>
      <MobileView />
      <DesktopView />
    </>
  );
};

const Tab2 = ({ data }) => {
  const [isOpenContratosDialog, setIsOpenContratosDialog] = useState(false);

  const fields = [
    { label: 'Nombre', value: data.empleado?.nombre || 'N/A' },
    { label: 'Primer apellido', value: data.empleado?.primerApellido || 'N/A' },
    { label: 'Segundo apellido', value: data.empleado?.segundoApellido || 'N/A' },
    { label: 'NIF', value: data.empleado?.nif || 'N/A' },
    {
      label: 'Estado', value: (
        <Pill
          identifier={data.empleado?.estadoEmpleado?.nombre}
          mapColor={STATUS_EMPLEADO_COLOR_MAP}
        >
          {data.empleado?.estadoEmpleado?.nombre || 'N/A'}
        </Pill>
      )
    },
    { label: 'Direccion', value: data.empleado?.direccion?.full_address || 'N/A' },
    { label: 'Email', value: data.empleado?.email || 'N/A' },
    { label: 'Email secundario', value: data.empleado?.emailSecundario || 'N/A' },
    { label: 'Telefono', value: data.empleado?.telefono || 'N/A' },
    { label: 'Telefono de emergencia', value: data.empleado?.telefonoEmergencia || 'N/A' },
    {
      label: 'Contrato',
      value: (
        <button
          onClick={() => setIsOpenContratosDialog(true)}
          className="flex items-center gap-2 text-custom-primary hover:text-custom-primary/80 dark:text-custom-orange dark:hover:text-custom-orange/80 transition-colors"
        >
          <span className="text-sm font-medium">Contratos vigentes</span>
          <Icon name="ArrowUpRight" size="16" />
        </button>
      )
    },
  ];

  return (
    <>
      <div className="block md:hidden space-y-0">
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
      <div className="hidden md:grid md:grid-cols-2 overflow-hidden rounded-[20px]">
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
      
      {isOpenContratosDialog && (
        <ContratosVigentesDialog
          model={data.empleado?.id}
          open={isOpenContratosDialog}
          onOpenChange={setIsOpenContratosDialog}
        />
      )}
    </>
  );
};

function SheetTableContent({ data }) {

  return (
    <div className="space-y-6">
      {/* cabecera del usuario en caso de haber usuario accesible */}
      <SheetTableHeader data={data.user} />

      {/* contenido del sheet */}
      <Tabs defaultValue="tab1" className="w-full">
        <TabsList className={`w-full h-12 grid ${data.empleado ? 'grid-cols-2' : 'grid-cols-1'} bg-custom-gray-default/50 dark:bg-custom-gray-darker/50 rounded-lg p-1`}>
          <TabsTrigger
            value="tab1"
            className="h-10 px-2 md:px-3 text-sm font-medium transition-all text-custom-gray-dark data-[state=active]:text-custom-gray-semiDark data-[state=active]:bg-white dark:text-gray-300 dark:data-[state=active]:bg-custom-gray-sidebar dark:data-[state=active]:text-white rounded-md"
          >
            <span className="whitespace-nowrap truncate">
              Información de contrato
            </span>
          </TabsTrigger>
          {data.empleado && (
            <TabsTrigger
              value="tab2"
              className="h-10 px-2 md:px-3 text-sm font-medium transition-all text-custom-gray-dark data-[state=active]:text-custom-gray-semiDark data-[state=active]:bg-white dark:text-gray-300 dark:data-[state=active]:bg-custom-gray-sidebar dark:data-[state=active]:text-white rounded-md"
            >
              <span className="whitespace-nowrap truncate">
                Información de empleado
              </span>
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent className="mt-4 w-full" value="tab1">
          <Tab1 data={data} />
        </TabsContent>
        {data.empleado && (
          <TabsContent className="mt-4 w-full" value="tab2">
            <Tab2 data={data} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

export default SheetTableContent

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import SheetTableHeader from "./SheetTableHeader";
import Icon from "@/imports/LucideIcon";
import Pill from '@/Components/App/Pills/Pill';
import STATUS_EMPLEADO_COLOR_MAP from "@/Components/App/Pills/constants/StatusEmpleadoMapColor";
import { TableCell } from "./Components/TableCell";
import { GridCell } from "./Components/GridCell";
import ContratosVigentesDialog from "@/Components/App/Empleado/ContratosVigentesDialog/ContratosVigentesDialog";

const PersonalInformation = ({ data }) => {
  const personalFields = [
    { label: 'Alias', value: data.name },
    { label: 'Correo', value: data.email },
    { label: 'Rol', value: data.role?.name },
  ];

  // Versión móvil
  const MobileView = () => (
    <div className="block sm:hidden space-y-2">
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

  // Versión desktop
  const DesktopView = () => (
    <div className="hidden sm:grid sm:grid-cols-2 overflow-hidden rounded-[20px]">
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
    { label: 'Id', value: data.empleado?.id || 'N/A' },
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
    { label: 'Direccion', value: data.empleado?.direccion?.full_address || 'N/A' },
    { label: 'Email', value: data.empleado?.email || 'N/A' },
    { label: 'Email secundario', value: data.empleado?.emailSecundario || 'N/A' },
    { label: 'Telefono', value: data.empleado?.telefono || 'N/A' },
    { label: 'Telefono de emergencia', value: data.empleado?.telefonoEmergencia || 'N/A' },
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

function SheetTableContent({ data }) {

  return (
    <>
      {/* cabecera del usuario en caso de haber usuario accesible */}
      <SheetTableHeader data={data} />

      {/* contenido del sheet */}
      <Tabs defaultValue="tab1" className="w-full mt-6">
        <TabsList className={`w-full h-12 grid ${data.empleado ? 'grid-cols-2' : 'grid-cols-1'} bg-custom-gray-default/50 dark:bg-custom-gray-darker/50 rounded-lg`}>
          <TabsTrigger
            value="tab1"
            className="h-full px-3 text-sm font-medium transition-all text-custom-gray-dark data-[state=active]:text-custom-gray-semiDark data-[state=active]:bg-white dark:text-gray-300 dark:data-[state=active]:bg-custom-gray-sidebar dark:data-[state=active]:text-white rounded-lg"
          >
            <span className="whitespace-nowrap">
              Información de usuario
            </span>
          </TabsTrigger>
          {data.empleado && (
            <TabsTrigger
              value="tab2"
              className="h-full px-3 text-sm font-medium transition-all text-custom-gray-dark data-[state=active]:text-custom-gray-semiDark data-[state=active]:bg-white dark:text-gray-300 dark:data-[state=active]:bg-custom-gray-sidebar dark:data-[state=active]:text-white rounded-lg"
            >
              <span className="whitespace-nowrap">
                Información de empleado
              </span>
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent className="mt-4 w-full" value="tab1">
          <PersonalInformation data={data} />
        </TabsContent>
        {data.empleado && (
          <TabsContent className="mt-4 w-full" value="tab2">
            <Tab2 data={data} />
          </TabsContent>
        )}
      </Tabs>
    </>
  )
}

export default SheetTableContent

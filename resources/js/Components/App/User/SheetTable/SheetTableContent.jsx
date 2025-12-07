import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import SheetTableHeader from "./SheetTableHeader";
import Icon from "@/imports/LucideIcon";
import Pill from '@/Components/App/Pills/Pill';
import STATUS_EMPLEADO_COLOR_MAP from "@/Components/App/Pills/constants/StatusEmpleadoMapColor";
import { TableCell } from "./Components/TableCell";
import { GridCell } from "./Components/GridCell";
import ContratosVigentesDialog from "@/Components/App/Empleado/ContratosVigentesDialog/ContratosVigentesDialog";
import STATUS_USUARIO_COLOR_MAP from '../../Pills/constants/StatusUsuarioMapColor';
import EmpleadoAvatar from "@/Components/App/Empleado/EmpleadoAvatar";

const PersonalInformation = ({ data }) => {
  const personalFields = [
    { label: 'Usuario', value: data.name },
    { label: 'Correo electrónico', value: data.email },
    { label: 'Rol', value: data.role?.name },
    {
      label: 'Estado', value: (
        <Pill
          identifier={data.status.name}
          children={data.status.label}
          mapColor={STATUS_USUARIO_COLOR_MAP}
          size="text-xs"
          textClassName="font-medium"
        />
      )
    },
    {
      label: 'Empleado asociado',
      value: data.empleado
        ? <EmpleadoAvatar empleado={data.empleado} />
        : <span className="text-gray-500">Sin empleado asociado</span>
    },
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
    { label: 'Tipo de documento', value: data.empleado?.tipoDocumento?.nombre || 'N/A' },
    { label: 'Número de documento', value: data.empleado?.nif || 'N/A' },
    { label: 'Caducidad del documento', value: data.empleado?.caducidadNif ? new Date(data.empleado.caducidadNif).toLocaleDateString('es-ES') : 'N/A' },
    { label: 'NISS', value: data.empleado?.niss || 'N/A' },
    {
      label: 'Estado', value: (
        console.log(data.empleado?.estadoEmpleado?.nombre),
        <Pill
          identifier={data.empleado?.estadoEmpleado?.nombre}
          mapColor={STATUS_EMPLEADO_COLOR_MAP}
        >
          {data.empleado?.estadoEmpleado?.nombre || ''}
        </Pill>
      )
    },
    { label: 'Fecha de nacimiento', value: data.empleado?.fechaNacimiento ? new Date(data.empleado.fechaNacimiento).toLocaleDateString('es-ES') : 'N/A' },
    { label: 'Género', value: data.empleado?.genero?.nombre || 'N/A' },
    { label: 'Dirección', value: data.empleado?.direccion?.full_address || 'N/A' },
    { label: 'Email corporativo', value: data.empleado?.email || 'N/A' },
    { label: 'Email personal', value: data.empleado?.emailSecundario || 'N/A' },
    { label: 'Teléfono', value: data.empleado?.telefono || 'N/A' },
    { label: 'Teléfono personal', value: data.empleado?.telefono_personal_movil || 'N/A' },
    { label: 'Teléfono personal fijo', value: data.empleado?.telefono_personal_fijo || 'N/A' },
    { label: 'Extensión centrex', value: data.empleado?.extension_centrex || 'N/A' },
    { label: 'Contacto de emergencia', value: data.empleado?.contactoEmergencia || 'N/A' },
    { label: 'Teléfono de emergencia', value: data.empleado?.telefonoEmergencia || 'N/A' },
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

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import SheetTableHeader from "./SheetTableHeader";
import Icon from "@/imports/LucideIcon";
import Pill from '@/Components/App/Pills/Pill';
import STATUS_EMPLEADO_COLOR_MAP from '@/Components/App/Pills/constants/StatusEmpleadoMapColor';
import { TableCell } from "./Components/TableCell";
import { GridCell } from "./Components/GridCell";
import ContratosVigentesDialog from '../ContratosVigentesDialog/ContratosVigentesDialog';
import { router, usePage } from '@inertiajs/react';

const PersonalInformation = ({ empleado }) => {
  const { auth } = usePage().props;
  
  const personalFields = [
    { label: 'Nombre', value: empleado.nombre },
    { label: 'Primer apellido', value: empleado.primerApellido },
    { label: 'Segundo apellido', value: empleado.segundoApellido },
    { label: 'Tipo de documento', value: empleado.tipoDocumento?.nombre },
    { label: 'Número de documento', value: empleado.nif },
    { 
      label: 'Caducidad del documento', 
      value: empleado.caducidadNif ? new Date(empleado.caducidadNif).toLocaleDateString('es-ES') : 'N/A' 
    },
    { label: 'NISS', value: empleado.niss },
    {
      label: 'Estado',
      value: <Pill
      identifier={empleado.estadoEmpleado?.nombre}
      mapColor={STATUS_EMPLEADO_COLOR_MAP}
      size="text-xs"
      >
        {empleado.estadoEmpleado?.nombre}
      </Pill>
    },
    { label: 'Fecha de nacimiento', value: empleado.fechaNacimiento ? new Date(empleado.fechaNacimiento).toLocaleDateString('es-ES') : 'N/A' },
    { label: 'Género', value: empleado.genero?.nombre },
    { label: 'Dirección', value: empleado.direccion?.full_address },
    { label: 'Email corporativo', value: empleado.email },
    { label: 'Email personal', value: empleado.emailSecundario },
    { label: 'Teléfono', value: empleado.telefono },
    { label: 'Teléfono personal', value: empleado.telefono_personal_movil },
    { label: 'Teléfono personal fijo', value: empleado.telefono_personal_fijo },
    { label: 'Extensión centrex', value: empleado.extension_centrex },
    { label: 'Contacto de emergencia', value: empleado.contactoEmergencia },
    { label: 'Teléfono de emergencia', value: empleado.telefonoEmergencia },
    { 
      label: 'Observaciones de salud', 
      value: empleado.observacionesSalud || 'Sin observaciones',
      condition: () => {
        // Verificar si el usuario actual puede ver observaciones de salud
        const { auth } = usePage().props;
        return auth.user?.roles?.some(role => 
          ['Administrator', 'Super Admin'].includes(role.name)
        );
      }
    },
  ];

  // Filtrar campos según permisos
  const filteredFields = personalFields.filter(field => {
    if (field.condition) {
      return field.condition();
    }
    return true;
  });

  // Versión móvil
  const MobileView = () => (
    <div className="block sm:hidden space-y-2">
      {filteredFields.map((field, index, array) => (
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
      {filteredFields.map((field, index) => (
        <GridCell
          key={field.label}
          label={field.label}
          value={field.value}
          isHeader={index === 0}
          isLast={index === filteredFields.length - 1}
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

const JobInformation = ({ empleado }) => {
  const [isOpenContratosDialog, setIsOpenContratosDialog] = useState(false);

  const jobFields = [
    {
      label: 'Tipo de empleado',
      value: <span className="text-sm">{empleado.tipoEmpleado.nombre}</span>
    },
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
              open={isOpenContratosDialog}
              onOpenChange={setIsOpenContratosDialog}
              model={empleado.id}
            />
          )}
        </>
      )
    },
    {
      label: 'Horario',
      value: 
        <button
          onClick={() => router.visit('/admin/horarios')}
          className="flex items-center gap-2 text-custom-gray-semiDark hover:text-custom-gray-dark dark:text-gray-300 dark:hover:text-white transition-colors"
        >
        <span className="text-sm font-medium">Horario</span>
        <Icon name="ArrowUpRight" size="16" />
      </button>
    },
    {
      label: 'Usuario asociado',
      value: <span className="text-sm">{empleado.user ? (empleado.user.name || empleado.user.email) : 'No disponible'}</span>
    },
  ];

  return (
    <>
      <div className="block sm:hidden space-y-2">
        {jobFields.map((field, index, array) => (
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
        {jobFields.map((field, index) => (
          <GridCell
            key={field.label}
            label={field.label}
            value={field.value}
            isHeader={index === 0}
            isLast={index === jobFields.length - 1}
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
      {data?.user && (
        <SheetTableHeader data={data?.user} />
      )}

      {/* contenido del sheet */}
      <Tabs defaultValue="personalinformation" className="w-full mt-6">
        <TabsList className="w-full h-12 grid grid-cols-2 bg-custom-gray-default/50 dark:bg-custom-gray-darker/50 rounded-lg">
          <TabsTrigger
            value="personalinformation"
            className="h-full px-3 text-sm font-medium transition-all text-custom-gray-dark data-[state=active]:text-custom-gray-semiDark data-[state=active]:bg-white dark:text-gray-300 dark:data-[state=active]:bg-custom-gray-sidebar dark:data-[state=active]:text-white rounded-lg"
          >
            <span className="whitespace-nowrap">
              Información personal
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="jobinformation"
            className="h-full px-3 text-sm font-medium transition-all text-custom-gray-dark data-[state=active]:text-custom-gray-semiDark data-[state=active]:bg-white dark:text-gray-300 dark:data-[state=active]:bg-custom-gray-sidebar dark:data-[state=active]:text-white rounded-lg"
          >
            <span className="whitespace-nowrap">
              Información laboral
            </span>
          </TabsTrigger>
        </TabsList>
        <TabsContent className="mt-4 w-full" value="personalinformation">
          <PersonalInformation empleado={data} />
        </TabsContent>
        <TabsContent className="mt-4 w-full" value="jobinformation">
          <JobInformation empleado={data} />
        </TabsContent>
      </Tabs>
    </>
  )
}

export default SheetTableContent
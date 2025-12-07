import { useState } from 'react'
import BlockCard from '@/Components/OwnUi/BlockCard';
import Icon from '@/imports/LucideIcon'
import ContratosVigentesDialog from "@/Components/App/Empleado/ContratosVigentesDialog/ContratosVigentesDialog";
import { Button } from '@/Components/App/Buttons/Button';

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
   * Contract component to display user and contract information - Responsive version
   * 
   * @param {Object} param0 - Props for the component
   * @returns {JSX.Element}
   */
  function Usuario({ contrato }) {
    const [isOpenContratosDialog, setIsOpenContratosDialog] = useState(false);

    // Validar que los datos existen
    if (!contrato || !contrato.user || !contrato.empleado) {
      return (
        <div className="p-4 text-red-500">
          <Icon name="AlertTriangle" className="w-4 h-4 inline mr-2" />
          Error: Datos de contrato incompletos
        </div>
      );
    }

    return (
      <section className="flex flex-col gap-4 p-4 border-b border-custom-gray-semiLight dark:border-custom-gray-semiDark last:border-b-0">
        
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* Usuario */}
          <div className="flex flex-col gap-3 flex-1 sm:w-1/2">
            <div className="flex items-center gap-3">
              <img 
                src={contrato.user?.profile_photo_url || '/images/profiles/default.png'} 
                alt={contrato.user?.name || 'Usuario'} 
                className="w-10 h-10 rounded-full flex-shrink-0" 
              />
              <div className="min-w-0 flex-1">
                <span className="block text-xs text-custom-gray-semiDark dark:text-custom-gray-dark sm:hidden">Usuario</span>
                <span className="block text-sm text-custom-black dark:text-custom-white font-medium truncate">
                  {contrato.user?.name || 'Sin nombre'}
                </span>
                <span className="block text-xs text-custom-black dark:text-custom-white opacity-50 truncate">
                  {contrato.user?.email || 'Sin email'}
                </span>
              </div>
            </div>

            {/* Botón Ver Contratos - Solo en desktop, debajo del email */}
            <div className="hidden sm:block ml-13">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsOpenContratosDialog(true)}
              >
                <Icon name="ArrowUpRight" size='14' className='text-custom-black dark:text-custom-white' />
                <span className="ml-1 text-xs text-custom-black dark:text-custom-white">Ver contratos</span>
              </Button>
            </div>
          </div>

          {/* Empleado */}
          <div className="flex items-center gap-2 flex-1 sm:w-1/2">
            <Icon name="Briefcase" className="w-4 h-4 text-custom-blue dark:text-custom-orange" />
            <span className="block text-xs text-custom-gray-semiDark dark:text-custom-gray-dark sm:hidden">Empleado:</span>
            <span className="text-sm text-custom-black dark:text-custom-white opacity-70 truncate">
              {contrato.empleado?.nombreCompleto || contrato.empleado?.nombre || 'Sin empleado'}
            </span>
          </div>
        </div>

        {/* Botón Ver Contratos - Solo en móvil, debajo del empleado */}
        <div className="block sm:hidden">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsOpenContratosDialog(true)}
          >
            <Icon name="ArrowUpRight" size='14' className='text-custom-black dark:text-custom-white' />
            <span className="ml-1 text-xs text-custom-black dark:text-custom-white">Ver contratos</span>
          </Button>
        </div>

        {isOpenContratosDialog && (
          <ContratosVigentesDialog
            model={contrato.empleado?.id}
            open={isOpenContratosDialog}
            onOpenChange={setIsOpenContratosDialog}
          />
        )}
      </section>
    )
  }

  return (
    <div className="space-y-6">
      {/* Información Principal */}
      <BlockCard title='Información'>
        <div className='rounded-xl overflow-hidden border border-custom-gray-default dark:border-custom-blackSemi'>
          <Section title="Nombre" value={data?.nombre || 'Sin nombre'} />
          <Section title="Mánager" value={
            data?.manager ? (
              <div className="flex items-center gap-2">
                <Icon name="User" className="w-4 h-4 text-custom-blue dark:text-custom-orange" />
                <span>{data.manager.nombreCompleto || data.manager.nombre || 'Sin nombre'}</span>
              </div>
            ) : 'Sin manager'
          } />
          <Section title="Descripción" value={
            <span className="break-words">{data?.descripcion || 'Sin descripción'}</span>
          } />
          <Section title="Adjunto" value={
            data?.adjunto ? (
              <div className="flex items-center gap-2">
                <Icon name="UserCheck" className="w-4 h-4 text-custom-blue dark:text-custom-orange" />
                <span>{data.adjunto.nombreCompleto || data.adjunto.nombre || 'Sin nombre'}</span>
              </div>
            ) : 'Sin adjunto'
          } />
          {data.parentDepartment && (
            <Section title="Departamento padre" value={data.parentDepartment.nombre} />
          )}
          <Section title="Número de empleados" value={data?.contratosVigentes?.length || 0} />
        </div>
      </BlockCard>

      {/* Contratos Vinculados */}
      <BlockCard title={`Contratos vinculados al departamento (${data?.contratosVigentes?.length || 0})`}>
        {data?.contratosVigentes && data.contratosVigentes.length > 0 ? (
          <div className="rounded-xl overflow-hidden border border-custom-gray-default dark:border-custom-blackSemi">
            {/* Header - Solo visible en desktop */}
            <div className="hidden sm:flex items-center px-4 py-3 text-custom-black dark:text-custom-white bg-custom-gray-default dark:bg-custom-blackSemi">
              <div className="w-1/2">
                <span className="text-sm font-semibold">Usuario</span>
              </div>
              <div className="w-1/2 text-right">
                <span className="text-sm font-semibold">Empleado</span>
              </div>
            </div>

            {/* Lista de contratos */}
            <div className="divide-y divide-custom-gray-semiLight dark:divide-custom-gray-semiDark max-h-[500px] overflow-y-auto dark:dark-scrollbar">
              {data.contratosVigentes.map((contrato, index) => (
                <Usuario key={contrato?.id || `contrato-${index}`} contrato={contrato} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-4 text-custom-gray-semiDark dark:text-custom-gray-dark">
            <Icon name='AlertTriangle' size='16' />
            <span className="text-sm">No hay contratos vinculados a este departamento</span>
          </div>
        )}
      </BlockCard>
    </div>
  )
}

export default SheetTableContent
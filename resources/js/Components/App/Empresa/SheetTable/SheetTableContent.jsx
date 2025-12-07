import BlockCard from '@/Components/OwnUi/BlockCard';
import Icon from '@/imports/LucideIcon';

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
   * Centro component to display center information - Responsive version
   * 
   * @param {Object} param0 - Props for the component
   * @returns {JSX.Element}
   */
  function Centro({ centro }) {
    return (
      <section className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-custom-gray-semiLight dark:border-custom-gray-semiDark last:border-b-0">
        {/* Centro */}
        <div className="flex-1 sm:w-1/3">
          <span className="block text-xs text-custom-gray-semiDark dark:text-custom-gray-dark sm:hidden">Centro</span>
          <span className="text-sm text-custom-black dark:text-custom-white font-medium">{centro.nombre}</span>
        </div>
        
        {/* Ubicación */}
        <div className="flex-1 sm:w-1/3">
          <span className="block text-xs text-custom-gray-semiDark dark:text-custom-gray-dark sm:hidden">Ubicación</span>
          <span className="text-sm text-custom-black dark:text-custom-white opacity-70 break-words">{centro.direccion?.full_address || 'N/A'}</span>
        </div>
        
        {/* Responsable */}
        <div className="flex items-center gap-2 flex-1 sm:w-1/3">
          <span className="block text-xs text-custom-gray-semiDark dark:text-custom-gray-dark sm:hidden">Responsable:</span>
          <img 
            src={centro.responsable?.user?.profile_photo_url || '/images/profiles/default.png'} 
            alt={centro.responsable?.user?.name || 'Responsable'} 
            className="w-8 h-8 rounded-full flex-shrink-0" 
          />
          <span className="text-sm text-custom-black dark:text-custom-white opacity-70 truncate">
            {centro.responsable?.nombreCompleto || 'Sin responsable'}
          </span>
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-6">
      {/* Información Principal */}
      <BlockCard title='Información'>
        <div className='rounded-3xl overflow-auto border-4 border-custom-gray-default dark:border-custom-blackSemi'>
          <Section title="Nombre" value={data.nombre} />
          <Section title="Siglas" value={data?.siglas || 'Sin siglas'} />
          <Section title="CIF" value={data?.cif || 'Sin CIF'} />
          <Section title="Responsable" value={
            data?.representante ? (
              <div className="flex items-center gap-2">
                <img 
                  src={data.representante.user?.profile_photo_url || '/images/profiles/default.png'} 
                  alt={data.representante.user?.name || 'Representante'} 
                  className="w-8 h-8 rounded-full flex-shrink-0" 
                />
                <span className="text-sm text-custom-black dark:text-custom-white truncate">
                  {data.representante.nombreCompleto || 'Sin nombre'}
                </span>
              </div>
            ) : 'Sin responsable'
          } />

          <Section title="Adjunto" value={
            data?.adjunto ? (
              <div className="flex items-center gap-2">
                <img 
                  src={data.adjunto.user?.profile_photo_url || '/images/profiles/default.png'} 
                  alt={data.adjunto.user?.name || 'Adjunto'} 
                  className="w-8 h-8 rounded-full flex-shrink-0" 
                />
                <span className="text-sm text-custom-black dark:text-custom-white truncate">
                  {data.adjunto.nombreCompleto || 'Sin nombre'}
                </span>
              </div>
            ) : 'Sin adjunto'
          } />

          <Section title="Dirección fiscal" value={data.direccion.full_address} />

          <Section title="Email" value={data.email} />

          <Section title="Teléfono" value={data.telefono} />
        </div>
      </BlockCard>

      {/* Centros */}
      <BlockCard title={`Centros (${data?.centros?.length || 0})`}>
        {data?.centros && data.centros.length > 0 ? (
          <div className="rounded-xl overflow-hidden border border-custom-gray-default dark:border-custom-blackSemi">
            {/* Header - Solo visible en desktop */}
            <div className="hidden sm:flex items-center px-4 py-3 text-custom-black dark:text-custom-white bg-custom-gray-default dark:bg-custom-blackSemi">
              <div className="w-1/3">
                <span className="text-sm font-semibold">Centro</span>
              </div>
              <div className="w-1/3">
                <span className="text-sm font-semibold">Ubicación</span>
              </div>
              <div className="w-1/3">
                <span className="text-sm font-semibold">Responsable</span>
              </div>
            </div>

            {/* Lista de centros */}
            <div className="divide-y divide-custom-gray-semiLight dark:divide-custom-gray-semiDark max-h-[500px] overflow-y-auto dark:dark-scrollbar">
              {data.centros.map((centro, index) => (
                <Centro key={centro.id || index} centro={centro} />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-4 text-custom-gray-semiDark dark:text-custom-gray-dark">
            <Icon name='AlertTriangle' size='16' />
            <span className="text-sm">No hay centros asignados a esta empresa</span>
          </div>
        )}
      </BlockCard>
    </div>
  )
}

export default SheetTableContent
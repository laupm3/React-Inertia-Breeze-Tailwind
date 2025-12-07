import { useDialogData } from '../Context/DialogDataContext';
import BlockCard from '@/Components/OwnUi/BlockCard'
import { Button } from '@/Components/App/Buttons/Button'
import Icon from '@/imports/LucideIcon'
import icons from '../Utils/icons'

function PersonalizarEquipo({ errors, localData, handleChange }) {
  const {
    model,
    permissions,
  } = useDialogData();

  return (
    <BlockCard title='Imagen del equipo' className='w-full'>
      {/* Layout responsive: columna en móvil, fila en desktop */}
      <section className='flex flex-col md:flex-row gap-6'>
        
        {/* Preview del icono - centrado en móvil, izquierda en desktop */}
        <div className='flex flex-col items-center md:items-start gap-4'>
          <div
            className='w-24 h-24 sm:w-28 sm:h-28 p-4 rounded-xl mx-auto md:mx-0'
            style={{
              backgroundColor: localData?.bg_color,
            }}
          >
            <Icon
              name={localData?.icon}
              className='w-full h-full'
              color={localData?.icon_color}
            />
          </div>
        </div>

        {/* Grid de iconos y controles - responsive */}
        {(permissions?.canUpdateTeam || !model) && (
          <div className='flex-1'>
            <h4 className="text-sm font-bold text-custom-blue dark:text-custom-white mb-3 text-center md:text-left">
              Seleccionar icono
            </h4>
            <div className='flex flex-col md:flex-row gap-4'>
              {/* Sección de iconos */}
              <div className='flex-1'>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-2">
                  {icons.map((icon, index) => (
                    <Button
                      key={index}
                      variant='ghost'
                      size='icon'
                      onClick={() => handleChange('icon', icon)}
                      className="w-8 h-8 sm:w-10 sm:h-10"
                    >
                      <Icon
                        name={icon}
                        className={`w-5 h-5 sm:w-5 sm:h-5 ${localData?.icon === icon ? 'text-custom-orange' : 'text-custom-gray-semiLight'}`}
                      />
                    </Button>
                  ))}
                </div>
              </div>

              {/* Controles de color a la derecha */}
              <div className='flex flex-row md:flex-col gap-4 md:gap-3 justify-center md:justify-start'>
                {/* Campo: Color de fondo */}
                <div className="flex flex-col items-center md:items-start gap-2">
                  <span className="text-xs sm:text-sm font-bold text-custom-blue dark:text-custom-white text-center md:text-left">
                    Color de fondo
                  </span>
                  <input
                    type="color"
                    value={localData?.bg_color}
                    onChange={(e) => handleChange('bg_color', e.target.value)}
                    className="w-12 h-8 rounded cursor-pointer"
                  />
                </div>

                {/* Campo: Color de icono */}
                <div className="flex flex-col items-center md:items-start gap-2">
                  <span className="text-xs sm:text-sm font-bold text-custom-blue dark:text-custom-white text-center md:text-left">
                    Color de icono
                  </span>
                  <input
                    type="color"
                    value={localData?.icon_color}
                    onChange={(e) => handleChange('icon_color', e.target.value)}
                    className="w-12 h-8 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Campo: titular del team */}
      {model && (
        <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            Equipo creado por:
          </span>
          <div className='flex flex-row items-center gap-4'>
            <img
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full"
              src={localData?.owner?.profile_photo_url}
              alt={localData?.owner?.name}
            />
            <div className='flex flex-col'>
              <span className='text-sm'>{localData?.owner?.name}</span>
              <span className='text-xs opacity-75'>{localData?.owner?.email}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Errores */}
      <div className="mt-2">
        {errors?.icon && <span className="text-xs text-red-500 block">{errors.icon}</span>}
        {errors?.icon_color && <span className="text-xs text-red-500 block">{errors.icon_color}</span>}
        {errors?.bg_color && <span className="text-xs text-red-500 block">{errors.bg_color}</span>}
      </div>
    </BlockCard>
  )
}

export default PersonalizarEquipo
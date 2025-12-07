/**
 * Componente que muestra un esqueleto de carga para el diálogo de contratos vigentes.
 * 
 * @component
 * @returns {JSX.Element} Esqueleto de carga animado
 */
function DialogSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Esqueleto para timeline de contratos */}
      <div className="w-64 max-h-[370px] overflow-y-auto dark:dark-scrollbar">
        <div className="animate-pulse">
          {[...Array(3)].map((_, contratoIndex) => (
            <div key={contratoIndex} className="relative flex flex-col items-start pb-6">
              {contratoIndex < 2 && (
                <div className="w-1 bg-gray-300 dark:bg-gray-700 absolute ml-2 h-full" />
              )}
              
              <div className="flex flex-row items-start gap-3">
                <div className="min-w-5 min-h-5 rounded-full z-10 bg-gray-300 dark:bg-gray-700 border-4 border-gray-300 dark:border-gray-700" />
                
                <div className="flex flex-col space-y-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-28"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
                </div>
              </div>

              {contratoIndex === 0 && (
                <div className="flex flex-col pt-2">
                  <div className="flex flex-row items-start gap-3">
                    <div className="min-w-5 min-h-5 rounded-full z-10 bg-gray-300 dark:bg-gray-700 border-4 border-gray-300 dark:border-gray-700" />
                    <div className="flex flex-col space-y-1">
                      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Esqueleto para panel de detalles de contrato */}
      <div className="border-4 border-custom-gray-default p-4 rounded-xl flex-1">
        <div className="animate-pulse">
          {/* Título del contrato */}
          <div className="flex items-center gap-1 mb-2">
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-4"></div>
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-40"></div>
          </div>

          {/* Grid de información del contrato */}
          <div className="lg:grid lg:grid-cols-2 gap-5 space-y-3 lg:space-y-0">
            <div className="bg-custom-gray-default p-6 rounded-xl space-y-3">
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-28"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-36"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
              </div>
            </div>

            <div className="bg-custom-gray-default p-5 rounded-xl space-y-3">
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-28"></div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-36"></div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Esqueleto para sección de jornadas */}
          <div className="mt-4">
            <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-16 mb-2"></div>
            
            {/* Esqueleto para componentes WeekDay */}
            <div className="flex flex-wrap gap-1">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex">
                  {/* Barra de color lateral */}
                  <div className="h-full min-h-full w-[10px] min-w-[10px] bg-gray-300 dark:bg-gray-700 rounded-ss-xl rounded-es-xl" />
                  
                  {/* Contenido del WeekDay */}
                  <div className="flex flex-col flex-1 py-2 px-3 bg-custom-gray-default dark:bg-custom-blackSemi rounded-ee-xl rounded-se-xl gap-1 max-w-[12rem] min-w-[12rem]">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                    <div className="flex items-center gap-1">
                      <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
                      <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-4"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DialogSkeleton;
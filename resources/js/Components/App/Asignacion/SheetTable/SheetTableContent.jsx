import BlockCard from '@/Components/OwnUi/BlockCard';
import Icon from "@/imports/LucideIcon";
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Button } from '@/Components/App/Buttons/Button';
import { useState } from 'react';

function SheetTableContent({ data }) {

  const { t } = useTranslation(["datatable"]);
  const asignacion = data;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const InformacionBasica = () => (
    <>
      <h2 className="text-custom-orange dark:text-custom-orangeLight text-xl sm:text-3xl font-bold mb-4">
        {asignacion.nombre}
      </h2>
      <span className="text-lg font-bold text-custom-blue dark:text-custom-white">
        Información
      </span>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            {t("tables.nombreasignacion")}
          </span>
          <div className="text-sm p-3 rounded-full bg-custom-gray-default/40 dark:bg-custom-blackSemi text-custom-gray-semiDark dark:text-custom-white">
            {asignacion.nombre}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-sm font-bold text-custom-blue dark:text-custom-white">
            {t("tables.descripcionasignacion")}
          </span>
          <div className="text-sm p-3 rounded-xl bg-custom-gray-default/40 dark:bg-custom-blackSemi text-custom-gray-semiDark dark:text-custom-white min-h-[100px]">
            {asignacion.descripcion}
          </div>
        </div>
      </div>
    </>
  );

  const ContratosVinculados = () => {
    const contratos = asignacion?.contratosVigentes || [];
    const totalPages = Math.ceil(contratos.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = contratos.slice(startIndex, endIndex);

    return (
      <BlockCard
        title={<span className="text-custom-blue dark:text-custom-white">{t("tables.contratosvinculados")}</span>}
        marginLeft="sm:ml-4"
        className="border-0 rounded-xl p-2 sm:p-4 bg-white dark:bg-custom-blackLight"
      >
        <div className="flex flex-col gap-2">
          {contratos.length === 0 ? (
            <span className="text-sm text-custom-gray-dark dark:text-custom-gray-default">
              {t("tables.nocontratosvinculados")}
            </span>
          ) : (
            <>
              {currentItems.map((contrato) => (
                <div
                  key={contrato.id}
                  className="flex items-center justify-between py-2 px-2 sm:px-4 bg-custom-gray-default/40 dark:bg-custom-blackSemi rounded-lg"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                      {contrato.empleado.user ? (
                        <AvatarImage
                          src={contrato.empleado.user.profile_photo_url}
                          alt={contrato.empleado.nombre}
                        />
                      ) : (
                        <AvatarFallback className="bg-custom-gray-light dark:bg-custom-blackSemi text-custom-blue dark:text-custom-white">
                          {contrato.empleado.nombre[0]}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-bold text-custom-blue dark:text-custom-white">
                        {contrato.empleado.nombre}
                      </span>
                      <span className="text-custom-gray-dark dark:text-custom-gray-default hidden sm:block">
                        {contrato.empleado.email}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Paginación solo si hay más de una página */}
              {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 py-2 sm:py-4">
                  <div className="flex-1 text-xs sm:text-sm text-custom-gray-dark dark:text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className='bg-custom-gray-default/40 dark:bg-custom-blackSemi hover:bg-custom-gray-light dark:hover:bg-custom-blackLight'
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <Icon name='ChevronLeft' className="h-4 w-4 text-custom-blue dark:text-custom-white" />
                  </Button>
                  <div className="flex justify-between text-sm text-custom-gray-dark dark:text-muted-foreground py-2">
                    <span>
                      Página {currentPage} de {totalPages}
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className='bg-custom-gray-default/40 dark:bg-custom-blackSemi hover:bg-custom-gray-light dark:hover:bg-custom-blackLight'
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <Icon name='ChevronRight' className="h-4 w-4 text-custom-blue dark:text-custom-white" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </BlockCard>
    );
  };

  return (
    <>
      <InformacionBasica />
      <ContratosVinculados />
    </>
  )
}

export default SheetTableContent
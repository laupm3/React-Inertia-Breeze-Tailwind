import { useState } from 'react'

import { Input } from '@/Components/ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/Components/ui/dropdown-menu";
import { Button } from "@/Components/ui/button";

import { useTranslation } from 'react-i18next';

import Events from '@/Blocks/Events/Events'
import Icon from '@/imports/LucideIcon'

function HistoricLayout({ }) {
  const { t } = useTranslation('vacationRequest')

  const { i18n } = useTranslation();

  const [FilterColumnSearchOpen, setFilterColumnSearchOpen] = useState(false);
  const [isVisibleFiltros, setIsVisibleFiltros] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  return (

    <div className='flex flex-col lg:flex-row justify-center w-full p-14 gap-20'>
      {/* Calendario de eventos */}
      <div className='w-full lg:w-2/5'>
        <Events />
      </div>

      {/* Detalles de permisos */}
      <div className='flex flex-col w-full h-[calc(100vh-200px)] lg:w-3/5 space-y-8 overflow-y-auto dark:dark-scrollbar'>
        {/* Filtrado/Busqueda/Creación de permisos */}
        <div className='flex w-full justify-between items-center'>
          {/* Filtro - Lado izquierdo */}
          <div>
            <DropdownMenu open={FilterColumnSearchOpen} onOpenChange={setFilterColumnSearchOpen} modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-full bg-hidden border-none"
                  onClick={(e) => setIsVisibleFiltros(!isVisibleFiltros)}
                >
                  Filtros <Icon name="SlidersHorizontal" className="ml-1 w-5 text-custom-orange" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="bg-custom-gray-default dark:bg-custom-blackLight rounded-2xl"
                onCloseAutoFocus={(e) => e.preventDefault()} // Evita que el menú se cierre automáticamente
              >
                <div className="flex flex-col gap-2 p-2 w-full min-w-[20rem] max-w-[20rem]">
                  <div className="flex justify-between items-center w-full">
                    <h4 className="text-lg font-bold">
                      {t('tables.columnas')}
                    </h4>
                    <Button
                      className="bg-transparent hover:bg-slate-200 dark:hover:bg-accent text-custom-blue dark:text-custom-white rounded-full"
                      onClick={""}
                    >
                      Borrar filtro
                    </Button>
                  </div>
                  <div className="flex flex-col gap-y-3">

                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Lado derecho - Búsqueda y Crear permiso */}
          <div className='flex items-center space-x-2'>
            {/* Busqueda */}
            <div className="relative">
              <Icon name="Search" className="dark:text-custom-white text-custom-gray-dark w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                placeholder="Buscar"
                value={""}
                onChange={""}
                className="pl-10 rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
              />
            </div>

            {/* Crear permiso */}
            <div>
              <Button
                onClick={() => setIsOpenDialog(!isOpenDialog)}
                variant="outline"
                className="rounded-full bg-custom-orange hover:bg-custom-blue dark:hover:bg-custom-white dark:text-custom-black text-white hover:text-white flex items-center"
              >
                <span className="hidden sm:inline">Solcitar Permiso</span>
                <Icon name="Plus" className="w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
        {/* Listado de permisos */}
        <div>

        </div>
      </div>
    </div>
  )
}

export default HistoricLayout
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import Icon from "@/imports/LucideIcon";
import Maps from "@/Components/MapApi/Maps";
import { useTranslation } from 'react-i18next';
import Pill from "@/Components/App/Pills/Pill";
import STATUS_CENTRO_COLOR_MAP from "@/Components/App/Pills/constants/StatusCentroMapColor";

function DialogMap({ centers, open, onOpenChange }) {
  const { t } = useTranslation(['datatable']);


  /**
   * Renderiza el componente CentroInfo que manda la informacion de cada uno de los centros
   * 
   * @returns {JSX.Element}
   */
  const Centroinfo = ({ center }) => {
    return (
      <div className="bg-custom-white dark:bg-custom-blackLight dark:border-custom-gray-semiDark border-2 p-3 m-4 rounded-xl">
        <div className="flex">
          <Icon name="MapPin" className="w-4 text-custom-orange mr-2" />
          <h1 className="text-custom-blue dark:text-custom-white font-bold">{center.nombre}</h1>
        </div>
        <div className="flex">
          <Icon name="Map" className="w-4 text-custom-gray-dark dark:text-custom-gray-light mr-2" />
          <p className="text-sm text-custom-gray-semiDark dark:text-custom-gray-light">{center.direccion.full_address}</p>
        </div>
        <div className="flex">
          <Icon name="Phone" className="w-4 text-custom-gray-dark dark:text-custom-gray-light mr-2" />
          <p className="text-sm text-custom-gray-semiDark dark:text-custom-gray-light">{center.telefono}</p>
        </div>
        <div className="flex">
          <Pill
            identifier={center.estado.nombre}
            children={center.estado.nombre}
            mapColor={STATUS_CENTRO_COLOR_MAP}
            size="text-xs"
            textClassName="font-medium"
          />
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="rounded-full bg-custom-gray-default dark:bg-custom-blackSemi focus:border-none hover:bg-custom-gray-light dark:hover:bg-accent"
        >
          <Icon name="MapPin" className="w-4 dark:text-custom-white text-custom-gray-dark mr-2" /> {t('tables.mapa')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[1025px] sm:h-[625px] flex bg-custom-white dark:bg-custom-blackLight">
        <div className="flex-auto max-w-full max-h-full bg-custom-white dark:bg-custom-blackLight overflow-hidden p-4">
          <div className="rounded-3xl overflow-hidden h-full">
            <Maps centers={centers} />
          </div>
        </div>

        <div className="flex-1 max-w-full max-h-full bg-custom-white dark:bg-custom-blackLight overflow-hidden">
          <DialogHeader className="flex items-start">
            <DialogTitle className="p-3">Lista de centros</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto h-full">
            {centers && centers.map((center, index) => (
              <Centroinfo key={index} center={center} />
            ))}
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}

export { DialogMap };
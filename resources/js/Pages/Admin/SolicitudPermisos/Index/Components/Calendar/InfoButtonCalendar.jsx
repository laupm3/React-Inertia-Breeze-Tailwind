import {
    Dialog as DialogBase,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription, 
    DialogFooter,
} from "@/Components/ui/dialog";

import { EVENT_COLORS } from './INITIAL_PERMISOS'; 

/**
 * Componente de diálogo para mostrar información del calendario y la leyenda de permisos.
 * @param {object} props
 * @param {boolean} props.isOpen - Si el diálogo está abierto o no.
 * @param {function} props.onClose - Función para cerrar el diálogo.
 * @param {Array<object>} [props.permisosData=[]] - Array de objetos con la información de cada tipo de permiso.
 * @returns {JSX.Element|null}
 */
export const InfoCalendarDialog = ({ isOpen, onClose, permisosData = [] }) => {
  if (!isOpen) return null;
  return (
    <DialogBase 
        open={isOpen} 
        onOpenChange={(openState) => {
            if (!openState) {
                onClose();
            }
        }}
    >
        <DialogContent className="bg-custom-white dark:bg-custom-blackLight text-custom-blackLight dark:text-custom-white w-full md:max-w-2xl lg:md:max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader className="px-6 py-4 border-b dark:border-gray-700">
                <DialogTitle className="text-lg font-medium">Leyenda de Permisos</DialogTitle>
                <DialogDescription>
                    Este diálogo muestra la leyenda de los diferentes tipos de permisos y sus detalles.
                </DialogDescription>
            </DialogHeader>
            
            <div className="flex-grow overflow-y-auto p-6">
                {permisosData && permisosData.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {permisosData.map(permiso => (
                            <div 
                                key={permiso.id} 
                                className="flex flex-col rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
                            >
                                <h3 
                                    className={`text-sm font-semibold p-3 ${EVENT_COLORS[permiso.nombre] || 'bg-gray-400 dark:bg-gray-600'} text-white text-center truncate`}
                                    title={permiso.nombre}
                                >
                                    {permiso.nombre}
                                </h3>
                                <div className="p-3 text-xs space-y-1 text-gray-700 dark:text-gray-300 flex-grow">
                                    <p>
                                        <strong className="font-medium">Nombre oficial:</strong><br /> 
                                        {permiso.nombre_oficial || '-'}
                                    </p>
                                    {permiso.descripcion_oficial && (
                                        <p>
                                            <strong className="font-medium">Observación oficial:</strong><br />
                                            {permiso.descripcion_oficial}
                                        </p>
                                    )}
                                    <p>
                                        <strong className="font-medium">Observación visual (empleado):</strong><br />
                                        {permiso.descripcion || '-'}
                                    </p>
                                </div>
                                <div className="px-3 pb-3 mt-auto">
                                    <span className="inline-block bg-gray-200 dark:bg-gray-600 rounded-full px-2.5 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200">
                                        {permiso.descripcion?.match(/\d+\s*días?(\s*naturales)?(\s*(desde el enlace|laborable|justificante médico o defunción|Justificante médico necesario))?/i)?.[0] || permiso.descripcion?.split('.')[0] || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="col-span-full text-center text-gray-500 dark:text-gray-400 py-10">
                        No hay información de tipos de permisos disponible.
                    </p>
                )}
            </div>

        </DialogContent>
    </DialogBase>
  );
};

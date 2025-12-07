import { Button } from "@/Components/ui/button";
import Icon from "@/imports/LucideIcon";
import { toast } from "sonner";
import axios from 'axios';
import { useState } from 'react';

/**
 * Componente genérico para descargar plantillas de importación
 * 
 * @param {Object} props
 * @param {string} props.entity - Nombre de la entidad (usuarios, empresas, etc.)
 * @param {string} props.displayName - Nombre legible para mostrar (Usuarios, Empresas, etc.)
 * @param {string} props.format - Formato del archivo (xlsx o csv)
 * @param {string} props.className - Clases CSS adicionales
 * @param {boolean} props.showIcon - Mostrar icono de descarga
 * @param {boolean} props.showText - Mostrar texto del botón
 * @param {string} props.variant - Variante del botón
 * @returns {JSX.Element}
 */
export default function GenerarPlantillaImport({ 
    entity, 
    displayName, 
    format = 'xlsx',
    className = '',
    showIcon = true,
    showText = true,
    variant = 'outline'
}) {
    const [isLoading, setIsLoading] = useState(false);

    if (!entity) {
        console.error('GenerarPlantillaImport: entity prop is required');
        return null;
    }

    const entityDisplayName = displayName || entity.charAt(0).toUpperCase() + entity.slice(1);

    const generarExcel = async () => {
        try {
            setIsLoading(true);
            
            const requestUrl = `/api/v1/admin/import/${entity}/template?format=${format}`;
            
            const response = await axios.get(requestUrl, {
                responseType: 'blob'
            });
            
            // Verificar si la respuesta es un blob (Excel/CSV) o JSON (error)
            const contentType = response.headers['content-type'];
            if (contentType && contentType.includes('application/json')) {
                // Es una respuesta de error en JSON
                const reader = new FileReader();
                reader.onload = async () => {
                    const errorData = JSON.parse(reader.result);
                    toast.error(`Error: ${errorData.message}`);
                };
                reader.readAsText(response.data);
                return;
            }
            
            // Es un archivo Excel/CSV
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `plantilla_${entity}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            toast.success(`Plantilla de ${entityDisplayName.toLowerCase()} descargada correctamente`);
        } catch (error) {
            // Intentar leer el mensaje de error detallado
            if (error.response?.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = async () => {
                    try {
                        const errorData = JSON.parse(reader.result);
                        toast.error(`Error: ${errorData.message}`);
                    } catch (e) {
                        toast.error(`Error al generar la plantilla de ${entityDisplayName.toLowerCase()}`);
                    }
                };
                reader.readAsText(error.response.data);
            } else {
                toast.error(`Error al generar la plantilla de ${entityDisplayName.toLowerCase()}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const baseClassName = "rounded-full bg-custom-gray-default dark:bg-custom-blackSemi hover:bg-custom-gray-light dark:hover:bg-accent focus:border-none flex items-center gap-2";
    const finalClassName = className ? `${baseClassName} ${className}` : baseClassName;

    return (
        <Button
            onClick={generarExcel}
            variant={variant}
            className={finalClassName}
            disabled={isLoading}
        >
            {showIcon && (
                isLoading ? (
                    <Icon name="Loader" className="h-4 w-4 animate-spin" />
                ) : (
                    <Icon name="Download" className="h-4 w-4" />
                )
            )}
            {showText && (
                <span className="hidden sm:inline">
                    Descargar Plantilla {entityDisplayName}
                </span>
            )}
        </Button>
    );
}

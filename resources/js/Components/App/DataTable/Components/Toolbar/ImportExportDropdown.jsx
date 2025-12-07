import Icon from "@/imports/LucideIcon";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/Components/ui/dropdown-menu";
import { useDataTable } from "../../Context/DataTableContext";
import { usePermissions } from "@/hooks/usePermissions";
import Spinner from "@/Components/App/Animations/Spinners/Spinner";
import { toast } from "sonner";
import axios from 'axios';
import ExportQueueHandler from "@/Components/ExportQueueHandler";
import { useState } from "react";
import GenericImportDialog from "@/Components/Import/GenericImportDialog";
import { Button } from "@/Components/App/Buttons/Button";

/**
 * Componente dropdown para importación y exportación de datos
 * 
 * @param {string} entity - Entidad para la cual manejar importación/exportación
 */
export default function ImportExportDropdown({ entity = 'empleados' }) {
  const { table, onDataRefresh } = useDataTable();
  const { canExport, canImport, loading } = usePermissions(entity);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [activeExports, setActiveExports] = useState({});
  const [visibleModalFilename, setVisibleModalFilename] = useState(null);

  // Si está cargando, mostrar spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center px-3 py-2">
        <Spinner size="sm" color="border-gray-400" />
      </div>
    );
  }

  // Si no tiene permisos de exportación ni importación, no mostrar nada
  if (!canExport && !canImport) {
    return null;
  }

  /**
   * Prepara el payload para exportar según la jerarquía:
   * 1. Si hay selección manual, exporta solo esas filas
   * 2. Si no, exporta las filas filtradas y ordenadas
   */
  const prepareExportPayload = () => {
    const { columnFilters, rowSelection, columnVisibility, sorting } = table.getState();
    const sortedRows = table.getSortedRowModel().rows;
    const allColumnIds = table.getAllLeafColumns().map(col => col.id);
    const processedVisibility = {};
    allColumnIds.forEach(colId => {
      processedVisibility[colId] = columnVisibility[colId] !== false;
    });
    const selectedRowIds = Object.keys(rowSelection);

    // Respeta el orden visual de la tabla para los seleccionados
    const rowsToExport = selectedRowIds.length > 0
      ? sortedRows.filter(row => selectedRowIds.includes(String(row.id))).map(row => row.id)
      : sortedRows.map(row => row.id);

    const filters = {};
    columnFilters.forEach(f => {
      if (f.value !== undefined && f.value !== null && f.value !== '') {
        filters[f.id] = Array.isArray(f.value) ? f.value : f.value;
      }
    });
    
    return {
      filters,
      selectedRows: rowsToExport,
      columnVisibility: processedVisibility,
      sorting,
      exportType: selectedRowIds.length > 0 ? 'selected' : 'filtered',
      totalRows: rowsToExport.length,
    };
  };

  const handleFileDownload = (response, defaultFilename) => {
    const blob = new Blob([response.data], {
      type: response.headers['content-type']
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    const contentDisposition = response.headers['content-disposition'];
    const filenameMatch = contentDisposition && contentDisposition.match(/filename="?([^"]*)"?/);
    const filename = filenameMatch ? filenameMatch[1] : defaultFilename;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  };

  const handleQueueResponse = (data) => {
    try {
      if (data.message) {
        toast.success(data.message);
      }
      if (data.filename) {
        setActiveExports(prev => ({
            ...prev,
            [data.filename]: {
                filename: data.filename,
                estimatedTime: 30, // 30 segundos estimados
                checkStatusUrl: `/api/v1/admin/export/${entity}/status`,
                downloaded: false // <-- Nuevo estado para seguimiento de descarga
            }
        }));
        setVisibleModalFilename(data.filename);
      }
    } catch (error) {
      toast.error('Error al procesar la respuesta del servidor');
    }
  };

  const exportData = async (exportType) => {
    try {
      const exportPayload = prepareExportPayload();
      
      const url = route('api.v1.admin.export.export', { entity, format: exportType });
      
      const defaultFilename = `export_${entity}.${exportType}`;
      
      const response = await axios.post(
        url,
        exportPayload,
        { 
          responseType: 'blob',
          headers: {
            'Accept': 'application/json, application/octet-stream'
          },
        }
      );
      
      if (response.headers['content-type'].includes('application/json')) {
        const responseText = await response.data.text();
        const data = JSON.parse(responseText);
        handleQueueResponse(data);
      } else {
        handleFileDownload(response, defaultFilename);
        toast.success(`Archivo ${exportType.toUpperCase()} descargado correctamente`);
      }
    } catch (error) {
      if (error.response && error.response.status === 202) {
        handleQueueResponse(error.response.data);
        return;
      }
      toast.error(`Error al exportar los datos en formato ${exportType.toUpperCase()}`);
      if (error.response && error.response.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          // Puedes mostrar el error si lo deseas
        };
        reader.readAsText(error.response.data);
      }
    }
  };

  const handleExportFinished = (filename) => {
    setActiveExports(prev => {
        const newExports = { ...prev };
        delete newExports[filename];
        return newExports;
    });
    if (visibleModalFilename === filename) {
        setVisibleModalFilename(null);
    }
  };

  const handleDownloadComplete = (filename) => {
    setActiveExports(prev => {
        if (!prev[filename]) return prev;
        const newExports = { ...prev };
        newExports[filename] = { ...newExports[filename], downloaded: true };
        return newExports;
    });
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon">
                <Icon name="Ellipsis" className="w-4" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-custom-gray-default dark:bg-custom-blackLight">
            {canExport && (
              <>
                <DropdownMenuItem onClick={() => exportData('csv')} className="px-2 py-1.5 focus:bg-custom-gray-semiLight dark:focus:bg-custom-blackSemi">
                    <Icon name="FileSpreadsheet" className="w-4 h-4 mr-2" /> 
                    Exportar CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportData('xlsx')} className="px-2 py-1.5 focus:bg-custom-gray-semiLight dark:focus:bg-custom-blackSemi">
                    <Icon name="FileSpreadsheet" className="w-4 h-4 mr-2" /> 
                    Exportar XLS
                </DropdownMenuItem>
              </>
            )}
            {canImport && (
              <DropdownMenuItem onClick={() => setIsImportModalOpen(true)} className="px-2 py-1.5 focus:bg-custom-gray-semiLight dark:focus:bg-custom-blackSemi">
                  <Icon name="Import" className="w-4 h-4 mr-2" /> 
                  Importar
              </DropdownMenuItem>
            )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Menú desplegable para las exportaciones activas */}
      {Object.keys(activeExports).length > 0 && (() => {
          const inProgress = Object.values(activeExports).filter(exp => !exp.downloaded).length;
          const completed = Object.values(activeExports).filter(exp => exp.downloaded).length;
          const isAnyInProgress = inProgress > 0;
          
          return (
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border-none font-medium shadow-none transition text-white ${
                            isAnyInProgress 
                                ? 'bg-custom-orange animate-pulse' 
                                : 'bg-green-500 hover:bg-green-600'
                        }`}
                        type="button"
                    >
                        <Icon 
                            name={isAnyInProgress ? "Loader" : "Download"} 
                            className={`w-4 h-4 ${isAnyInProgress ? 'animate-spin' : ''}`} 
                        />
                        <span className="hidden sm:inline">
                            {isAnyInProgress 
                                ? `${inProgress} en curso...` 
                                : `${completed} completado${completed !== 1 ? 's' : ''}`
                            }
                        </span>
                    </button>
                  </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-custom-gray-default dark:bg-custom-blackLight">
                <div className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  {inProgress > 0 && completed > 0 
                    ? `${inProgress} en curso, ${completed} completadas`
                    : inProgress > 0 
                      ? "Exportaciones en Curso"
                      : "Exportaciones Completadas"
                  }
                </div>
                {Object.values(activeExports).map(exportData => (
                    <DropdownMenuItem 
                        key={exportData.filename} 
                        onSelect={() => setVisibleModalFilename(exportData.filename)}
                        className="px-2 py-1.5 cursor-pointer focus:bg-custom-gray-semiLight dark:focus:bg-custom-blackSemi"
                    >
                        <Icon 
                            name={exportData.downloaded ? "FileSpreadsheet" : "FileClock"} 
                            className={`w-4 h-4 mr-2 ${exportData.downloaded ? "text-green-500" : "text-orange-500"}`}
                        /> 
                        <div className="flex flex-col flex-1">
                            <span className="truncate text-sm">
                                {exportData.filename}
                            </span>
                            <span className={`text-xs ${exportData.downloaded ? "text-green-500" : "text-orange-500"}`}>
                                {exportData.downloaded ? "✓ Completado" : "⏳ En curso..."}
                            </span>
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
                </DropdownMenu>
            );
        })()}

      {/* Renderizar los modales para TODAS las exportaciones activas, pero solo uno será visible a la vez */}
      {Object.values(activeExports).map(exportData => (
        <ExportQueueHandler
            key={exportData.filename}
            isVisible={visibleModalFilename === exportData.filename}
            onClose={() => setVisibleModalFilename(null)}
            onFinish={handleExportFinished}
            onDownload={handleDownloadComplete}
            filename={exportData.filename}
            estimatedTime={exportData.estimatedTime}
            checkStatusUrl={exportData.checkStatusUrl}
            entity={entity}
        />
      ))}

      {/* Modal de importación genérico */}
      <GenericImportDialog
        entity={entity}
        entityDisplayName={getEntityDisplayName(entity)}
        isOpen={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        canImport={canImport}
        canExport={canExport}
        loadingPerms={loading}
        onImportSuccess={(result) => {
          // Refrescar los datos desde el contexto padre si está disponible
          if (onDataRefresh && typeof onDataRefresh === 'function') {
            onDataRefresh();
          }
          
          // Resetear la tabla para limpiar filtros y selecciones
          if (table && typeof table.reset === 'function') {
            table.reset();
          }
          
          toast.success(`${getEntityDisplayName(entity)} importados correctamente`);
        }}
        onImportError={() => {
          toast.error(`Error al importar ${getEntityDisplayName(entity).toLowerCase()}`);
        }}
      />
    </div>
  );
}

/**
 * Obtiene el nombre de visualización para una entidad
 * 
 * @param {string} entity - Nombre de la entidad
 * @returns {string} - Nombre de visualización
 */
function getEntityDisplayName(entity) {
  const displayNames = {
    'empleados': 'Empleados',
    'empresas': 'Empresas',
    'centros': 'Centros',
    'departamentos': 'Departamentos',
    'contratos': 'Contratos',
    'asignaciones': 'Asignaciones',
    'usuarios': 'Usuarios',
    'horarios': 'Horarios',
    'turnos': 'Turnos',
    'roles': 'Roles',
    'permisos': 'Permisos',
    'solicitudes': 'Solicitudes de Permiso'
  };
  return displayNames[entity] || entity.charAt(0).toUpperCase() + entity.slice(1);
}

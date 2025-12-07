import CreateUpdateView from './Partials/CreateUpdateView';
import { ViewContextProvider } from './Context/ViewContext';
import { DataHandlerContextProvider } from './Context/DataHandlerContext';
import SheetTableView from './Partials/SheetTableView';
import AdvanceMultiselectPortal from './Partials/AdvanceMultiselectPortal';
import { AdvanceMultiselectContextProvider } from './Context/AdvanceMultiselectContext';
import React from 'react';

/**
 * Componente avanzado de multiselección con tabla, búsqueda y opciones de creación/edición.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.defaultValue - Array de IDs o valor único de elementos seleccionados inicialmente
 * @param {Function} props.onChangeValue - Callback cuando cambia la selección, recibe array de IDs
 * @param {Function} props.renderSelection - Función para personalizar la visualización de elementos seleccionados
 * @param {Function} props.getItemId - Función que extrae el identificador único de un elemento
 * @param {string} props.fetchUrl - URL para obtener los datos 
 * @param {Function} props.transformData - Función para transformar los datos antes de usarlos
 * @param {string} props.dataKey - Clave para extraer los datos de la respuesta API
 * @param {Array} props.columns - Columnas personalizadas para la tabla
 * @param {boolean} props.enableCreateUpdateView - Habilitar vista de creación/edición
 * @param {boolean} props.enableSheetTableView - Habilitar vista de tabla
 * @param {React.Component} props.CreateUpdateViewComponent - Componente para la vista de creación/edición
 * @param {React.Component} props.SheetTableViewComponent - Componente para la vista de tabla
 * @param {number} props.cacheDuration - Duración del cache en milisegundos
 */
export default React.memo(function AdvanceMultiselect({
    defaultValue = null,
    onChangeValue = () => { },
    renderSelection = null,
    getItemId = (value) => value?.id,
    fetchUrl = null,
    transformData = (data) => data,
    dataKey = null,
    columns = null,
    enableCreateUpdateView = false,
    enableSheetTableView = false,
    CreateUpdateViewComponent = null,
    SheetTableViewComponent = null,
    cacheDuration = 5 * 60 * 1000, // 5 minutos
    placeholder = "Selecciona opciones"
}) {

    return (
        <div className="max-w-full w-full overflow-hidden">
            <ViewContextProvider
                enableCreateUpdateView={enableCreateUpdateView}
                enableSheetTableView={enableSheetTableView}
                CreateUpdateViewComponent={CreateUpdateViewComponent}
                SheetTableViewComponent={SheetTableViewComponent}
            >
                <DataHandlerContextProvider
                    fetchUrl={fetchUrl}
                    transformData={transformData}
                    dataKey={dataKey}
                    getItemId={getItemId}
                    cacheDuration={cacheDuration}
                >
                    <AdvanceMultiselectContextProvider
                        defaultValue={defaultValue}
                        onChangeValue={onChangeValue}
                        renderSelection={renderSelection}
                        getItemId={getItemId}
                        placeholder={placeholder}
                    >
                        <AdvanceMultiselectPortal
                            columns={columns}
                            showCreateButton={enableCreateUpdateView}
                        />
                        <CreateUpdateView />
                        <SheetTableView />
                    </AdvanceMultiselectContextProvider>
                </DataHandlerContextProvider>
            </ViewContextProvider>
        </div>
    )
});
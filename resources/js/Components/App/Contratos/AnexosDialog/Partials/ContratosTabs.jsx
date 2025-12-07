import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { format } from "date-fns";
import { Button } from "@/Components/ui/button";
import { cn } from "@/lib/utils";
import Icon from '@/imports/LucideIcon';
import AnexoActions from './AnexoActions';
import FormularioAnexo from './FormularioAnexo';
import InformacionContrato from './InformaciónContrato';
import { es } from "date-fns/locale";

// --- Componente para la Pestaña de Contrato ---
const ContratoTab = ({ isEditing, onEdit, onAdd, onInfo }) => {
    return (
        <InformacionContrato
            isEditing={isEditing}
            onEdit={onEdit}
            onAdd={onAdd}
            onInfo={onInfo}
        />
    );
};

// --- Componente para la Pestaña de Anexos ---
const AnexosTab = ({ 
    anexos, 
    selectedAnexo, 
    isEditing, 
    handleSelectAnexo, 
    handleEdit, 
    handleEditAnexo,
    handleDelete, 
    handleAddAnexo, 
    handleShowInfo, 
    model 
}) => {
    const selectedIndex = anexos.findIndex(a => a.id === selectedAnexo?.id);
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 py-4">
            <div className="lg:col-span-1">
                <div className="flex flex-col h-full bg-gray-50 dark:bg-custom-blackSemi p-4 rounded-lg">
                    <div className="flex justify-between items-center text-sm font-semibold text-gray-500 dark:text-gray-400 px-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                        <span>Anexo</span>
                        <span>Fecha inicio</span>
                    </div>
                    <div className="flex-grow mt-2 space-y-1">
                        {anexos.length > 0 ? (
                            anexos.map((anexo, index) => (
                                <button 
                                    key={anexo.id} 
                                    onClick={() => handleSelectAnexo(anexo)} 
                                    className={cn(
                                        "w-full flex justify-between items-center text-left p-2 rounded-md transition-colors", 
                                        selectedAnexo?.id === anexo.id ? "bg-custom-gray-light text-custom-blackSemi dark:bg-custom-blackSemi dark:text-white" : "hover:bg-gray-200 dark:hover:bg-gray-700"
                                    )}
                                >
                                    <span className="font-semibold">{`Anexo ${index + 1}`}</span>
                                    <span className="text-sm text-gray-600 dark:text-gray-300">{anexo.fecha_inicio ? format(new Date(anexo.fecha_inicio), "PPP", { locale: es }) : 'Nuevo'}</span>
                                </button>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                                <p className="text-sm">No hay anexos</p>
                                <p className="text-xs mt-1">Añade un anexo para comenzar</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-4">
                        <Button variant="outline" className="w-full rounded-full bg-transparent dark:text-white" onClick={handleAddAnexo}>
                            <Icon name="Plus" className="mr-2 h-4 w-4" />
                            Añadir Anexo
                        </Button>
                    </div>
                </div>
            </div>
            <div className="lg:col-span-3">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold dark:text-white">
                        {!selectedAnexo 
                            ? "Datos del contrato" 
                            : selectedAnexo && (typeof selectedAnexo.id === 'string' && selectedAnexo.id.startsWith('new_'))
                                ? "Nuevo Anexo"
                                : `Anexo ${selectedIndex !== -1 ? selectedIndex + 1 : ''}`
                        }
                    </h2>
                    {selectedAnexo && (
                        <AnexoActions
                            onEdit={handleEditAnexo || handleEdit}
                            onDelete={handleDelete}
                            onAdd={handleAddAnexo}
                            onInfo={handleShowInfo}
                            empleado={model?.empleado}
                            canDelete={true}
                            showEditActions={selectedAnexo && selectedAnexo.id && typeof selectedAnexo.id !== 'string'}
                        />
                    )}
                </div>
                <FormularioAnexo isEditing={isEditing} />
            </div>
        </div>
    );
};


// --- Componente Principal de Pestañas ---
export default function ContractTabs({
    model,
    anexos,
    selectedAnexo,
    isEditing,
    handleSelectAnexo,
    handleEdit,
    handleEditAnexo,
    handleDelete,
    handleAddAnexo,
    handleShowInfo
}) {
    const [activeTab, setActiveTab] = useState("anexos");

    // Función modificada para añadir anexo y cambiar de pestaña
    const handleAddAnexoAndSwitchTab = () => {
        handleAddAnexo(); // Crear el anexo
        setActiveTab("anexos"); // Cambiar a la pestaña de anexos
    };

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-custom-gray-default/50 dark:bg-custom-gray-darker/50 rounded-lg">
                <TabsTrigger 
                    value="contratos"
                    className="h-full px-3 text-sm font-medium transition-all text-custom-gray-dark data-[state=active]:text-custom-gray-semiDark data-[state=active]:bg-white dark:text-gray-300 dark:data-[state=active]:bg-custom-gray-sidebar dark:data-[state=active]:text-white rounded-lg"
                >
                    Contratos
                </TabsTrigger>
                <TabsTrigger 
                    value="anexos"
                    className="h-full px-3 text-sm font-medium transition-all text-custom-gray-dark data-[state=active]:text-custom-gray-semiDark data-[state=active]:bg-white dark:text-gray-300 dark:data-[state=active]:bg-custom-gray-sidebar dark:data-[state=active]:text-white rounded-lg"
                >
                    Anexos
                </TabsTrigger>
            </TabsList>

            <TabsContent value="contratos" className="mt-4">
                {activeTab === "contratos" && (
                    <ContratoTab 
                        isEditing={isEditing}
                        onEdit={handleEdit}
                        onAdd={handleAddAnexoAndSwitchTab} // Usar la función modificada
                        onInfo={handleShowInfo}
                    />
                )}
            </TabsContent>

            <TabsContent value="anexos" className="mt-4">
                {activeTab === "anexos" && (
                    <AnexosTab
                        anexos={anexos}
                        selectedAnexo={selectedAnexo}
                        isEditing={isEditing}
                        handleSelectAnexo={handleSelectAnexo}
                        handleEdit={handleEdit}
                        handleEditAnexo={handleEditAnexo}
                        handleDelete={handleDelete}
                        handleAddAnexo={handleAddAnexo} // Mantener la función original aquí
                        handleShowInfo={handleShowInfo}
                        model={model}
                    />
                )}
            </TabsContent>
        </Tabs>
    );
}

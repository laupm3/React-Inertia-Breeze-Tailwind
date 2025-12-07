import { useDialogData } from '../Context/DialogDataContext';
import { useEffect, useState, useRef } from "react";
import CreateUpdateDialog from "../../CreateUpdateDialog/CreateUpdateDialog";
import SheetTable from "../../SheetTable/SheetTable";
import ContractTabs from './ContratosTabs';
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import Icon from "@/imports/LucideIcon";
import ContratosVigentesDialog from "@/Components/App/Empleado/ContratosVigentesDialog/ContratosVigentesDialog";
import { toast } from 'sonner';

export default function FormFields() {
    const { 
        form, 
        model, 
        empleado_id, 
        empleado, 
        deleteAnexo, 
        selectedAnexo, 
        setSelectedAnexo,
        contractData,
        isEditingMode,
        setIsEditingMode
    } = useDialogData();

    const anexos = form.data?.anexos || [];
    const [isEditing, setIsEditing] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showSheetTable, setShowSheetTable] = useState(false);
    const [isOpenContratosDialog, setIsOpenContratosDialog] = useState(false);
    
    // Usar ref para trackear el ID del anexo anterior
    const previousAnexoIdRef = useRef(null);

    useEffect(() => {
        if (selectedAnexo) {
            const isExistingAnexo = selectedAnexo.id && typeof selectedAnexo.id !== 'string';
            setIsEditing(isExistingAnexo);
            
            // Solo resetear el modo de edición si realmente estamos cambiando a un anexo diferente
            if (previousAnexoIdRef.current !== null && previousAnexoIdRef.current !== selectedAnexo.id) {
                setIsEditingMode(false);
            }
            
            // Actualizar la referencia del anexo actual
            previousAnexoIdRef.current = selectedAnexo.id;
        }
    }, [selectedAnexo, setIsEditingMode]);

    const areFieldsDisabled = isEditing && !isEditingMode;

    const getInitials = () => {
        if (!empleado) return '??';
        if (empleado.nombre && empleado.primerApellido) {
            return `${empleado.nombre[0]}${empleado.primerApellido[0]}`;
        }
        if (empleado.name) {
            const parts = empleado.name.split(',');
            if (parts.length > 1) {
                return `${parts[1].trim()[0]}${parts[0].trim()[0]}`;
            }
            const nameParts = empleado.name.split(' ');
            return nameParts.length > 1 ? `${nameParts[0][0]}${nameParts[1][0]}` : nameParts[0].substring(0, 2);
        }
        return '??';
    };

    const getFullName = () => {
        if (!empleado) return '';
        if (empleado.nombre) {
            return `${empleado.nombre} ${empleado.primerApellido || ''} ${empleado.segundoApellido || ''}`.trim();
        }
        if (empleado.name) {
            const parts = empleado.name.split(',');
            if (parts.length > 1) {
                return `${parts[1].trim()} ${parts[0].trim()}`;
            }
            return empleado.name;
        }
        return '';
    };

    const handleSelectAnexo = (anexo) => {
        setSelectedAnexo(anexo);
    };

    const handleEdit = () => {
        setShowEditDialog(true);
    };

    const handleEditAnexo = () => {
        setIsEditingMode(true);
    };

    const handleShowInfo = () => {
        setShowSheetTable(true);
    };

    const handleEditSave = (updatedContractData) => {
        form.setData(prev => ({
            ...prev,
            ...updatedContractData
        }));
        setShowEditDialog(false);
    };

    const handleDelete = async () => {
        if (!selectedAnexo) {
            return;
        }

        const anexoIdToDelete = selectedAnexo.id;
        const currentIndex = anexos.findIndex(a => a.id === anexoIdToDelete);
        const newAnexos = anexos.filter(a => a.id !== anexoIdToDelete);
        
        form.setData('anexos', newAnexos);

        if (typeof anexoIdToDelete === 'string' && anexoIdToDelete.startsWith('new_')) {
            toast.success('Anexo temporal eliminado');
        } else {
            await deleteAnexo(anexoIdToDelete);
        }

        // Si no quedan anexos, seleccionar null; si quedan, seleccionar el anterior o el primero
        setSelectedAnexo(newAnexos[currentIndex - 1] || newAnexos[0] || null);
    };

    const handleAddAnexo = () => {
        if (!contractData) return;

        const referenceAnexo = anexos.length > 0 ? anexos[0] : contractData;

        // Helper para convertir valores a string de manera segura
        const toSafeString = (value) => {
            if (value === null || value === undefined || value === '') return '';
            return value.toString();
        };

        const newAnexo = {
            id: `new_${Date.now()}`,
            n_expediente: contractData.n_expediente || referenceAnexo.n_expediente || '',
            tipo_contrato_id: toSafeString(contractData.tipo_contrato_id || referenceAnexo.tipo_contrato_id),
            departamento_id: toSafeString(contractData.departamento_id || referenceAnexo.departamento_id),
            asignacion_id: toSafeString(contractData.asignacion_id || referenceAnexo.asignacion_id),
            empresa_id: toSafeString(contractData.empresa_id || referenceAnexo.empresa_id),
            centro_id: toSafeString(contractData.centro_id || referenceAnexo.centro_id),
            empleado_id: toSafeString(contractData.empleado_id || referenceAnexo.empleado_id),
            jornada_id: '',
            fecha_inicio: '',
            fecha_fin: null,
        };

        const newAnexosList = [...anexos, newAnexo];
        form.setData('anexos', newAnexosList);
        setSelectedAnexo(newAnexo);
    };

    return (
        <>
            <div className="flex flex-col-reverse min-[500px]:flex-row min-[500px]:justify-between min-[500px]:items-center gap-4 mb-6">
                {empleado && (
                    <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 rounded-full">
                            <AvatarImage
                                src={empleado?.user?.profile_photo_url || empleado?.profile_photo_url}
                                alt={getFullName()}
                            />
                            <AvatarFallback className="rounded-full">
                                {getInitials()}
                            </AvatarFallback>
                        </Avatar>
                        <h1 className="text-xl font-semibold text-custom-blue dark:text-custom-white">
                            {getFullName()}
                        </h1>
                    </div>
                )}
                <button
                    onClick={() => setIsOpenContratosDialog(true)}
                    className="w-full min-[500px]:w-auto flex items-center justify-center gap-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 text-custom-gray-dark dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    <Icon name="History" size="16" />
                    <span className="text-sm font-medium">Historial de contratos</span>
                </button>
            </div>

            {isOpenContratosDialog && (
                <ContratosVigentesDialog
                    model={empleado_id}
                    open={isOpenContratosDialog}
                    onOpenChange={setIsOpenContratosDialog}
                />
            )}

            <ContractTabs
                model={model}
                anexos={anexos}
                selectedAnexo={selectedAnexo}
                isEditing={areFieldsDisabled}
                handleSelectAnexo={handleSelectAnexo}
                handleEdit={handleEdit}
                handleEditAnexo={handleEditAnexo}
                handleDelete={handleDelete}
                handleAddAnexo={handleAddAnexo}
                handleShowInfo={handleShowInfo}
            />

            <CreateUpdateDialog
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                model={model}
                onSaveData={handleEditSave}
            />

            <SheetTable
                open={showSheetTable}
                onOpenChange={setShowSheetTable}
                model={model}
                enableToView={true}
            />
        </>
    );
}
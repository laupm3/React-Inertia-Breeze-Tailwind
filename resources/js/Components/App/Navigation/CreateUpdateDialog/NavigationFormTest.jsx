import React, { useState } from 'react';
import { Button } from "@/Components/ui/button";
import CreateUpdateDialog from './CreateUpdateDialog';
import { testValues } from '../Schema/ModelSchema';

/**
 * Componente de prueba para el formulario de navegación
 * 
 * Este componente sirve para probar todas las funcionalidades del formulario
 * de navegación incluidas las siguientes características:
 * - Selector de iconos optimizado con lazy loading
 * - Selectores de API para navegación padre y permisos
 * - Selector de peso (1-5 puntos)
 * - Switches para importantes y recientes
 * - Validación de formulario con Zod
 * 
 * @returns {JSX.Element} Componente de prueba
 */
export default function NavigationFormTest() {
    const [isOpen, setIsOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [model, setModel] = useState(null);

    const handleCreate = () => {
        setModel(null);
        setEditMode(false);
        setIsOpen(true);
    };

    const handleEdit = () => {
        setModel(testValues);
        setEditMode(true);
        setIsOpen(true);
    };

    const handleSave = (data) => {
        console.log('Datos guardados:', data);
        // Aquí se haría la llamada a la API real
        setIsOpen(false);
    };

    return (
        <div className="p-8 space-y-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                    Prueba del Formulario de Navegación
                </h1>
                
                <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                    <p>Este formulario incluye:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>🎯 Selector de iconos optimizado (lazy loading, búsqueda)</li>
                        <li>🏗️ Selectores de API para navegación padre y permisos</li>
                        <li>⚖️ Selector de peso visual (1-5 puntos)</li>
                        <li>🔄 Switches para elementos importantes y recientes</li>
                        <li>✅ Validación completa con Zod</li>
                    </ul>
                </div>

                <div className="flex gap-4">
                    <Button 
                        onClick={handleCreate}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        ➕ Crear Nuevo
                    </Button>
                    
                    <Button 
                        onClick={handleEdit}
                        variant="outline"
                        className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                        ✏️ Editar Ejemplo
                    </Button>
                </div>

                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="font-semibold mb-2">Datos de ejemplo para edición:</h3>
                    <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(testValues, null, 2)}
                    </pre>
                </div>
            </div>

            <CreateUpdateDialog
                open={isOpen}
                onOpenChange={setIsOpen}
                model={model}
                onSaveData={handleSave}
            />
        </div>
    );
}

import { useState } from 'react';

import BlockCard from '@/Components/OwnUi/BlockCard';
import { Input } from "@/Components/ui/input";
import { Button } from '@/Components/App/Buttons/Button';
import ContratosVigentesDialog from '@/Components/App/Empleado/ContratosVigentesDialog/ContratosVigentesDialog';

import Icon from '@/imports/LucideIcon';

export default function WorkData({ user }) {
    const [contratosDialogOpen, setContratosDialogOpen] = useState(false);

    const empleado = user?.empleado;

    const departamento = empleado?.departamentos?.[0]?.nombre ||
        empleado?.contratos?.[0]?.departamento?.nombre ||
        'No asignado';

    const responsableEmpleado = empleado?.contratos?.[0]?.centro?.responsable;
    const responsable = responsableEmpleado ? {
        nombre: responsableEmpleado.nombre || 'Sin nombre',
        avatar: responsableEmpleado.user?.profile_photo_url || null
    } : {
        nombre: 'No asignado',
        avatar: null
    };

    const centro = empleado?.contratos?.[0]?.centro?.nombre || 'No especificado';
    const empresa = empleado?.empresas?.[0]?.nombre || 'No especificado';
    const tipo_empleado = empleado?.tipo_empleado?.nombre || 'No especificado';

    // Obtener las asignaciones del empleado
    const asignaciones = empleado?.asignaciones || [];
    const asignacionActual = asignaciones[0]?.nombre || 'No asignado';

    const handleContratosVigentesView = () => {
        if (empleado?.id) {
            setContratosDialogOpen(true);
        }
    };

    return (
        <div className="md:max-h-[800px] md:overflow-y-auto md:pr-2 md:[scrollbar-width:thin] md:[scrollbar-color:rgba(156,163,175,0.3)_transparent] md:[&::-webkit-scrollbar]:w-[6px] md:[&::-webkit-scrollbar-track]:bg-transparent md:[&::-webkit-scrollbar-thumb]:bg-[rgba(156,163,175,0.3)] md:[&::-webkit-scrollbar-thumb]:rounded-[20px]">

            <BlockCard title="Datos Laborales">
                <div className="flex flex-col gap-8">
                    {/* Información básica laboral */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                        {/* Tipo de empleado */}
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Tipo de Empleado</span>
                            <Input
                                value={tipo_empleado}
                                disabled
                                className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                            />
                        </div>
                        {/* Asignación laboral */}
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Asignación</span>
                            <Input
                                value={asignacionActual}
                                disabled
                                className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                            />
                            {asignaciones.length > 1 && (
                                <span className="text-xs text-custom-gray-light">
                                    + {asignaciones.length - 1} asignación{asignaciones.length - 1 > 1 ? 'es' : ''} adicional{asignaciones.length - 1 > 1 ? 'es' : ''}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Departamento y Responsable */}
                    <div className="flex flex-col gap-4 w-full">
                        {/* Labels */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Departamento</span>
                                <Input
                                    value={departamento}
                                    disabled
                                    className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Responsable</span>
                                <div className="relative">
                                    <Input
                                        value={responsable.nombre}
                                        disabled
                                        className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi pl-12"
                                    />
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                        {responsable.avatar ? (
                                            <img src={responsable.avatar} alt={responsable.nombre} className="w-6 h-6 rounded-full" />
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-r bg-custom-orange text-white flex items-center justify-center text-xs font-semibold">
                                                {responsable.nombre?.charAt(0) || 'R'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </BlockCard >

            <BlockCard title="Información Laboral">
                <div className="flex flex-col gap-8">
                    {/* Centro y Empresa */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Centro</span>
                            <Input
                                value={centro}
                                disabled
                                className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Empresa</span>
                            <Input
                                value={empresa}
                                disabled
                                className="rounded-full dark:text-custom-gray-default bg-custom-gray-default dark:bg-custom-blackSemi"
                            />
                        </div>
                    </div>

                    {/* Contratos */}
                    <div className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-custom-blue dark:text-custom-white">Contratos y Jornadas</span>
                        <div>
                            {empleado?.id && (
                                <Button
                                    onClick={handleContratosVigentesView}
                                    variant="secondary"
                                    title="Ver contratos vigentes"
                                >
                                    <span>
                                        Ver contratos
                                    </span>
                                    <Icon
                                        name="ArrowUpRight"
                                        className="w-4 h-4 text-custom-blackLight dark:text-white group-hover:text-orange-500 transition-colors"
                                    />
                                </Button>
                            )}
                        </div>
                    </div>

                </div>
            </BlockCard>

            {/* Modal de contratos vigentes */}
            {
                empleado?.id && (
                    <ContratosVigentesDialog
                        open={contratosDialogOpen}
                        onOpenChange={setContratosDialogOpen}
                        model={empleado.id}
                    />
                )
            }
        </div >
    );
}
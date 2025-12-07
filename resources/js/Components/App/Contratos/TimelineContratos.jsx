import { useState, useEffect, useCallback, useMemo } from "react";
import { format } from "date-fns";

export default function TimelineContratos({ data = [], onItemClick }) {
    const [activeElement, setActiveElement] = useState(null);

    // Seleccionar el primer elemento por defecto al montar el componente
    useEffect(() => {
        if (data && data.length > 0 && !activeElement) {
            const firstElementId = "0";
            setActiveElement(firstElementId);
            onItemClick(data[0]);
        }
    }, [data, onItemClick, activeElement]);

    //Función para formatear la fecha
    //Se intenta formatear la fecha, si no se puede se devuelve la fecha original
    const formatDate = useCallback((dateString) => {
        if (!dateString) return "Sin fecha";
        try {
            return format(new Date(dateString), 'dd/MM/yyyy');
        } catch (e) {
            return dateString;
        }
    }, []);

    // Optimizado con useCallback para evitar recrear la función en cada render
    const handleItemClick = useCallback((item, elementId) => {
        if (activeElement !== elementId) {
            setActiveElement(elementId);
            onItemClick(item);
        }
    }, [activeElement, onItemClick]);

    //Función para verificar si un contrato o anexo está activo
    // Optimizado con useCallback para evitar recrear la función en cada render
    const isContractActive = useCallback((contratoIndex) => {
        if (!activeElement) return false;
        return activeElement.startsWith(contratoIndex.toString());
    }, [activeElement]);

    // Verificar si hay contratos disponibles con useMemo
    const hasContratos = useMemo(() => data && data.length > 0, [data]);

    if (!hasContratos) {
        return <div className="text-center py-4">No hay contratos disponibles</div>;
    }

    return (
        <div>
            {/* Contratos */}
            {data.map((contrato, contratoIndex) => {
                const isContratoVigente = contrato.is_vigente;
                const isActive = isContractActive(contratoIndex);

                return (
                    <div key={contratoIndex} className="relative flex flex-col items-start hover:cursor-pointer pb-6">
                        {/* Línea solo si hay más contratos o anexos después */}
                        {(contratoIndex < data.length - 1 ||
                            (contrato.anexos &&
                                contrato.anexos.length > 0)) && (
                                <div
                                    className="w-1 bg-custom-gray-semiLight absolute ml-2"
                                    style={{
                                        height: contratoIndex === data.length - 1 && contrato.anexos && contrato.anexos.length > 0
                                            ? `calc(${contrato.anexos.length * 40}px + 10px)` // Ajustar altura si es el último contrato y tiene anexos
                                            : '100%'
                                    }}
                                />
                            )}

                        <div
                            className="flex flex-row items-start gap-3"
                            onClick={() => handleItemClick(contrato, contratoIndex.toString())}
                        >
                            <div
                                className={`min-w-5 min-h-5 rounded-full z-10
                                ${isContratoVigente ? "bg-custom-orange border-4 border-custom-orange" : "bg-custom-gray-semiLight border-4 border-custom-gray-semiLight"}
                                ${activeElement == contratoIndex.toString() || isActive ? "border-custom-orange bg-custom-orange" : ""}
                            `}
                            />
                            <div className="flex flex-col">
                                <p className="text-xs sm:text-sm font-bold">{contrato.asignacion?.nombre || "Sin nombre"}</p>
                                <p className="text-xs">({formatDate(contrato.fechaInicio)})</p>
                            </div>
                        </div>

                        {/* Anexos - Optimizado con useMemo para evitar cálculos innecesarios */}
                        {useMemo(() => {
                            if (!contrato.anexos || !Array.isArray(contrato.anexos) || contrato.anexos.length === 0) {
                                return null;
                            }

                            return (
                                <div className="flex flex-col">
                                    {contrato.anexos.map((anexo, anexoIndex) => {
                                        const elementId = `${contratoIndex}-${anexoIndex}`;
                                        const isAnexoVigente = anexo.is_vigente;
                                        const enrichedAnexo = {
                                            ...anexo,
                                            asignacion: {
                                                ...contrato.asignacion,
                                                nombre: `Anexo ${anexoIndex + 1}`
                                            },
                                            tipo_contrato: contrato.tipo_contrato || contrato.tipoContrato,
                                            departamento: contrato.departamento,
                                            centro: contrato.centro,
                                            empresa: contrato.empresa
                                        };
                                        return (
                                            <div key={elementId} className="pt-2" onClick={(e) => {
                                                e.stopPropagation();
                                                handleItemClick(enrichedAnexo, elementId);
                                            }}>
                                                <div className="flex flex-row items-start gap-3">
                                                    <div
                                                        className={`min-w-5 min-h-5 rounded-full z-10
                                                        ${isAnexoVigente ? "bg-custom-orange border-4 border-custom-orange" : "bg-custom-gray-semiLight border-4 border-custom-gray-semiLight"}
                                                        ${activeElement === elementId ? "border-custom-orange bg-custom-orange" : ""}
                                                        ${isActive && activeElement !== elementId ? "border-custom-orange bg-custom-gray-semiLight" : ""}
                                                    `}
                                                    />
                                                    <div>
                                                        <p className="text-xs sm:text-sm font-bold">{`Anexo ${anexoIndex + 1}`}</p>
                                                        <p className="text-xs">({formatDate(anexo.fechaInicio)})</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        }, [contrato.anexos, contrato.asignacion, contrato.tipo_contrato, contrato.tipoContrato,
                        contrato.departamento, contrato.centro, contrato.empresa, contratoIndex,
                            formatDate, handleItemClick, activeElement, isActive])}
                    </div>
                );
            })}
        </div>
    );
}


import { useState, useEffect, useCallback } from "react";
import Icon from "@/imports/LucideIcon";
import Pill from "@/Components/App/Pills/Pill";
import VACACIONES_COLOR_MAP from "@/Components/App/Pills/constants/VacacionesMapColor";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/Components/ui/charts";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

/**
 * Componente inline para mostrar estadísticas de uso de permisos
 * Se muestra debajo de las instrucciones de fecha
 */
export default function PermisoStatsInline({
    selectedPermiso,
    empleadoId,
    fechaInicio,
    fechaFin
}) {
    const [statsData, setStatsData] = useState(null);
    const [isLoadingStats, setIsLoadingStats] = useState(false);
    const [statsError, setStatsError] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    // Función para procesar datos para el PieChart
    const prepareChartData = (yearData) => {
        if (!yearData) return [];
        
        const data = [];
        
        // Solo agregar "Tiempo usado" si realmente hay uso
        if (yearData.usage > 0) {
            const usedDays = Math.ceil(yearData.usage / (1000 * 60 * 60 * 24));
            data.push({
                name: "Tiempo usado",
                value: usedDays,
                color: "#3b82f6", // blue-500
                formatted: yearData.formatted_usage
            });
        }
        
        // Solo agregar "Tiempo restante" si hay tiempo restante
        if (yearData.remaining_usage > 0) {
            const remainingDays = Math.ceil(yearData.remaining_usage / (1000 * 60 * 60 * 24));
            data.push({
                name: "Tiempo restante",
                value: remainingDays,
                color: "#f97316", // orange-500
                formatted: yearData.remaining_usage_formatted
            });
        }
        
        // Si no hay tiempo usado, solo mostrar el tiempo total disponible
        if (yearData.usage === 0 && yearData.remaining_usage > 0) {
            const totalDays = Math.ceil(yearData.remaining_usage / (1000 * 60 * 60 * 24));
            return [{
                name: "Tiempo disponible",
                value: totalDays,
                color: "#22c55e", // green-500
                formatted: yearData.remaining_usage_formatted || yearData.max_formatted_duration
            }];
        }
        
        return data;
    };

    // Configuración del chart
    const chartConfig = {
        used: {
            label: "Tiempo usado",
            color: "#3b82f6",
        },
        remaining: {
            label: "Tiempo restante", 
            color: "#f97316",
        },
        available: {
            label: "Tiempo disponible",
            color: "#22c55e",
        },
    };

    // Función para cargar estadísticas (memoizada para evitar bucles)
    const loadStats = useCallback(async () => {
        if (!empleadoId || !selectedPermiso?.id || !fechaInicio || !fechaFin) {
            return;
        }

        setIsLoadingStats(true);
        setStatsError(null);

        try {
            const url = route('api.v1.admin.empleados.permiso-usage-stats', {
                empleado: empleadoId,
                permiso: selectedPermiso.id
            }) + `?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setStatsData(data.stats || null);
        } catch (error) {
            setStatsError(error.message);
        } finally {
            setIsLoadingStats(false);
        }
    }, [empleadoId, selectedPermiso?.id, fechaInicio, fechaFin]);

    // Cargar stats cuando cambien los parámetros
    useEffect(() => {
        // Solo cargar si todos los parámetros están presentes
        if (selectedPermiso?.id && empleadoId && fechaInicio && fechaFin) {
            loadStats();
        } else {
            // Limpiar datos si faltan parámetros
            setStatsData(null);
            setStatsError(null);
        }
    }, [loadStats]);

    // No mostrar nada si no hay todos los datos requeridos
    if (!selectedPermiso || !empleadoId || !fechaInicio || !fechaFin) {
        return null;
    }

    return (
        <div className="mt-3">
            {/* Toggle Button */}
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center justify-between w-full p-2 text-sm bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Icon name="ChartPie" className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-800 dark:text-blue-200">
                        Estadísticas de Uso
                    </span>
                    
                    {/* Estado indicators */}
                    {!empleadoId && (
                        <span className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-800 px-2 py-1 rounded-full">
                            Selecciona empleado
                        </span>
                    )}
                    {!selectedPermiso && empleadoId && (
                        <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                            Selecciona permiso
                        </span>
                    )}
                    {isLoadingStats && (
                        <Icon name="Loader" className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                    )}
                    {statsError && (
                        <span className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-800 px-2 py-1 rounded-full">
                            Error
                        </span>
                    )}
                    {statsData && !isLoadingStats && !statsError && (
                        <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded-full">
                            {Object.values(statsData).map(yearData => yearData.remaining_usage_formatted || '0 días').join(', ')} restantes
                        </span>
                    )}
                </div>
                <Icon 
                    name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                    className="w-4 h-4 text-blue-600 dark:text-blue-400" 
                />
            </button>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="border border-blue-200 dark:border-blue-800 rounded-md bg-blue-50/50 dark:bg-blue-900/10 p-3 mt-2">
                    {!empleadoId ? (
                        <div className="text-center py-4 text-yellow-600 dark:text-yellow-400">
                            <Icon name="User" className="w-6 h-6 mx-auto mb-2" />
                            <p className="text-sm">Selecciona un empleado para ver estadísticas</p>
                        </div>
                    ) : !selectedPermiso ? (
                        <div className="text-center py-4 text-gray-600 dark:text-gray-400">
                            <Icon name="FileText" className="w-6 h-6 mx-auto mb-2" />
                            <p className="text-sm">Selecciona un tipo de permiso para ver estadísticas</p>
                        </div>
                    ) : statsError ? (
                        <div className="text-center py-4 text-red-600">
                            <Icon name="AlertTriangle" className="w-6 h-6 mx-auto mb-2" />
                            <p className="text-sm">{statsError}</p>
                            <button
                                type="button"
                                onClick={loadStats}
                                className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Reintentar
                            </button>
                        </div>
                    ) : isLoadingStats ? (
                        <div className="text-center py-6">
                            <Icon name="Loader" className="w-6 h-6 mx-auto mb-2 animate-spin text-blue-600 dark:text-blue-400" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">Cargando estadísticas...</p>
                        </div>
                    ) : statsData ? (
                        <div className="space-y-4">
                            {/* Header con el tipo de permiso */}
                            <div className="text-center">
                                <Pill
                                    identifier={selectedPermiso.nombre}
                                    mapColor={VACACIONES_COLOR_MAP}
                                    size="sm"
                                >
                                    {selectedPermiso.nombre}
                                </Pill>
                            </div>
                            
                            {Object.entries(statsData).map(([year, data]) => {
                                const chartData = prepareChartData(data);
                                
                                return (
                                    <div key={year} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                                        <h4 className="font-medium text-sm mb-4 text-center text-gray-800 dark:text-gray-200">
                                            Año {year}
                                        </h4>
                                        
                                        {/* Grid con estadísticas principales */}
                                        <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                    {data.usage > 0 ? data.formatted_usage : '0 días'}
                                                </div>
                                                <div className="text-gray-600 dark:text-gray-400">Tiempo usado</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                                    {data.remaining_usage_formatted || '0 días'}
                                                </div>
                                                <div className="text-gray-600 dark:text-gray-400">Tiempo restante</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                                    {data.max_formatted_duration || '0 días'}
                                                </div>
                                                <div className="text-gray-600 dark:text-gray-400">Duración máxima</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                                    {data.count_approved_requests || 0}
                                                </div>
                                                <div className="text-gray-600 dark:text-gray-400">Solicitudes aprobadas</div>
                                            </div>
                                        </div>

                                        {/* PieChart solo si hay datos para mostrar */}
                                        {chartData.length > 0 && (
                                            <div className="mt-4">
                                                <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
                                                    Distribución del tiempo
                                                </h5>
                                                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                                                    <PieChart>
                                                        <ChartTooltip 
                                                            content={<ChartTooltipContent />}
                                                        />
                                                        <Pie
                                                            data={chartData}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={40}
                                                            outerRadius={80}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                        >
                                                            {chartData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                                            ))}
                                                        </Pie>
                                                    </PieChart>
                                                </ChartContainer>
                                                
                                                {/* Leyenda personalizada */}
                                                <div className="flex justify-center gap-4 mt-3">
                                                    {chartData.map((entry, index) => (
                                                        <div key={index} className="flex items-center gap-2">
                                                            <div 
                                                                className="w-3 h-3 rounded-full" 
                                                                style={{ backgroundColor: entry.color }}
                                                            />
                                                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                                                {entry.name}: {entry.formatted}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Barra de progreso */}
                                        {data.usage_percentage >= 0 && (
                                            <div className="mt-4">
                                                <div className="flex justify-between text-xs mb-1">
                                                    <span className="text-gray-600 dark:text-gray-400">Progreso de uso</span>
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">
                                                        {data.usage_percentage}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div 
                                                        className="bg-blue-600 h-2 rounded-full transition-all" 
                                                        style={{ 
                                                            width: `${Math.min(data.usage_percentage, 100)}%` 
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-600 dark:text-gray-400">
                            <Icon name="Info" className="w-6 h-6 mx-auto mb-2" />
                            <p className="text-sm">No hay datos disponibles para el período seleccionado</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

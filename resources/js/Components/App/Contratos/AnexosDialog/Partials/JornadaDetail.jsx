import { useEffect, useState } from 'react';
import axios from 'axios';
import Icon from '@/imports/LucideIcon'
import Spinner from '@/Components/App/Animations/Spinners/Spinner';
import { Card, CardContent } from "@/Components/ui/card";
import { cn } from '@/lib/utils';
import GetModalidadIcon from '@/Components/App/Horarios/Utils/GetModalidadIcon';

// Estado global para manejar cache y requests de jornadas
const jornadaState = {
    cache: new Map(),
    pendingRequests: new Map(),
    subscribers: new Map()
};

const JornadaDetail = ({ jornadaId }) => {
    const [jornada, setJornada] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        
        if (!jornadaId) {
            setJornada(null);
            setLoading(false);
            setError(null);
            return;
        }

        // Si ya está en cache, usar inmediatamente
        if (jornadaState.cache.has(jornadaId)) {
            setJornada(jornadaState.cache.get(jornadaId));
            setLoading(false);
            setError(null);
            return;
        }

        // Si hay un request pendiente, suscribirse
        if (jornadaState.pendingRequests.has(jornadaId)) {
            setLoading(true);
            setError(null);
            
            const unsubscribe = (data) => {
                if (data.success) {
                    setJornada(data.jornada);
                    setLoading(false);
                    setError(null);
                } else {
                    setError(data.error);
                    setLoading(false);
                }
            };

            jornadaState.subscribers.get(jornadaId).add(unsubscribe);
            
            return () => {
                const subscribers = jornadaState.subscribers.get(jornadaId);
                if (subscribers) {
                    subscribers.delete(unsubscribe);
                }
            };
        }

        // Crear nuevo request
        setLoading(true);
        setError(null);

        // Crear subscribers para este jornadaId
        jornadaState.subscribers.set(jornadaId, new Set());
        const subscribers = jornadaState.subscribers.get(jornadaId);

        const requestPromise = axios.get(route('api.v1.admin.jornadas.show', { jornada: jornadaId }))
            .then(response => {
                const jornadaData = response.data.jornada;
                
                // Guardar en cache
                jornadaState.cache.set(jornadaId, jornadaData);
                
                // Notificar a todos los suscriptores
                subscribers.forEach(callback => callback({ success: true, jornada: jornadaData }));
                
                // Limpiar
                jornadaState.pendingRequests.delete(jornadaId);
                jornadaState.subscribers.delete(jornadaId);
                
                return jornadaData;
            })
            .catch(err => {
                const errorMsg = 'Error al cargar la jornada.';
                
                // Notificar error a todos los suscriptores
                subscribers.forEach(callback => callback({ success: false, error: errorMsg }));
                
                // Limpiar
                jornadaState.pendingRequests.delete(jornadaId);
                jornadaState.subscribers.delete(jornadaId);
                
                throw err;
            });

        jornadaState.pendingRequests.set(jornadaId, requestPromise);

        // Suscribirse al propio request
        const unsubscribe = (data) => {
            if (data.success) {
                setJornada(data.jornada);
                setLoading(false);
                setError(null);
            } else {
                setError(data.error);
                setLoading(false);
            }
        };

        subscribers.add(unsubscribe);

        return () => {
            subscribers.delete(unsubscribe);
        };
    }, [jornadaId]);

    if (!jornadaId) {
        return null;
    }

    if (loading) {
        return <div className="flex justify-center items-center h-24"><Spinner /></div>;
    }

    if (error) {
        return <div className="text-red-500 text-center py-4">{error}</div>;
    }

    if (!jornada) {
        return null;
    }

    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    
    const turnosPorDia = diasSemana.map((dia, index) => {
        return jornada.esquema.find(jornadaTurno => jornadaTurno.weekday_number === index);
    });

    return (
        <div className="pt-4">
            <div className="flex space-x-2 overflow-x-auto">
                {turnosPorDia.map((turno, index) => (
                    <div key={diasSemana[index]} className="flex-shrink-0">
                        <div className="flex items-stretch h-full min-h-[80px] w-52 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
                            {turno ? (
                                <>
                                    {/* Barra de color lateral */}
                                    <div
                                        className="w-[10px] min-w-[10px] rounded-ss-xl rounded-es-xl"
                                        style={{ backgroundColor: turno.turno?.color || '#ccc' }}
                                    />
                                    {/* Contenido del turno */}
                                    <div className="flex flex-col flex-1 py-2 px-3 bg-custom-gray-default dark:bg-custom-blackSemi rounded-ee-xl rounded-se-xl gap-1 min-w-0">
                                        <div className="font-bold text-sm text-gray-900 dark:text-gray-100">
                                            {diasSemana[index]}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                                            <Icon name="Clock" className="w-3 h-3 flex-shrink-0" />
                                            <span>{turno.turno?.horaInicio?.substring(0, 5)}</span>
                                            <Icon name="ArrowRight" className="w-3 h-3 flex-shrink-0" />
                                            <span>{turno.turno?.horaFin?.substring(0, 5)}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 min-w-0">
                                            {turno.turno ? (
                                                <>
                                                    <div className="flex-shrink-0">
                                                        <GetModalidadIcon modalidad={turno.modalidad?.name || turno.turno?.modalidad?.name} className={'h-3 w-3'} />
                                                    </div>
                                                    <div className="truncate min-w-0">
                                                        <span className="truncate">
                                                            {turno.turno?.centro?.nombre || 'Sin centro'}
                                                        </span>
                                                        <span className="text-gray-400"> - </span>
                                                        <span className="truncate text-gray-500">
                                                            {turno.turno?.centro?.empresa?.nombre || 'Sin empresa'}
                                                        </span>
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-xs text-gray-500">Sin modalidad asignada</span>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Barra gris para descanso */}
                                    <div className="w-[10px] min-w-[10px] bg-gray-300 dark:bg-gray-600 rounded-ss-xl rounded-es-xl" />
                                    {/* Contenido de descanso */}
                                    <div className="flex flex-col flex-1 py-2 px-3 bg-gray-50 dark:bg-custom-blackSemi rounded-ee-xl rounded-se-xl justify-center">
                                        <div className="font-bold text-sm text-custom-blue dark:text-white">
                                            {diasSemana[index]}
                                        </div>
                                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                            Descanso
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JornadaDetail;
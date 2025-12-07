import { useState, useEffect, useCallback, useRef } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import Calendar from '@/Components/FullCalendar/FullCalendarComponent';
import { UserCalendarInfo } from '@/Components/FullCalendar/UserCalendarInformation';
import axios from 'axios';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export default function Index() {
    const [range, setRange] = useState({ from: null, to: null });
    const [horarios, setHorarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const cacheRef = useRef({});

    const generateCacheKey = (from, to) => `${from}_${to}`;

    const fetchHorarios = useCallback(async (from, to) => {
        const key = generateCacheKey(from, to);
        const now = Date.now();
        const cached = cacheRef.current[key];

        if (
            cached &&
            now - cached.timestamp < CACHE_TTL
        ) {
            // Usar datos del cache si aún no expiran
            setHorarios(cached.data);
            setRange({ from, to });
            setLoading(false);
            return;
        }

        // Carga en pantalla datos cacheados mientras se revalida si están disponibles pero vencidos
        if (cached) {
            setHorarios(cached.data); // Mostrar mientras tanto
            setLoading(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await axios.get(route('api.v1.user.horarios.index', { from, to }));
            if (response.status === 200) {
                const fetchedData = response.data.horarios;
                cacheRef.current[key] = {
                    data: fetchedData,
                    timestamp: now,
                };
                setHorarios(fetchedData);
            } else {
                setHorarios([]);
            }
        } catch (error) {
            console.error(error);
            // No borrar cache anterior en caso de fallo
        } finally {
            setRange({ from, to });
            setLoading(false);
        }
    }, []);

    return (
        <>
            <Head title="Horarios Empleado" />
            <div className="max-w-7xl mx-auto p-2 md:p-7 space-y-8">
                <UserCalendarInfo horarios={horarios} />
                <Calendar range={range} horarios={horarios} fetchHorarios={fetchHorarios} loading={loading} />
            </div>
        </>
    );
}

Index.layout = (page) => <AuthenticatedLayout>{page}</AuthenticatedLayout>;

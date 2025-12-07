export const WORK_SCHEDULE = {
    start: '09:00',
    end: '17:00',
    lateThreshold: 10, // minutos
    workingHoursPerDay: 8,
    workingHoursPerWeek: 40
};

export const MOCK_CLOCK_DATA = [
    {
        fecha: '2024-01-15',
        entrada: '09:00',
        salida: '17:00',
        notas: 'Día normal',
        totalHoras: '08:00',
        horarioLaboral: '09:00 - 17:00'
    },
    {
        fecha: '2024-01-16',
        entrada: '09:18',
        salida: '17:00',
        notas: 'Retraso por tráfico',
        totalHoras: '07:42',
        horarioLaboral: '09:00 - 17:00'
    },
    // ... más datos de ejemplo
];

export const TABLE_HEADERS = [
    { key: 'fecha', label: 'Fecha' },
    { key: 'entrada', label: 'Entrada' },
    { key: 'salida', label: 'Salida' },
    { key: 'notas', label: 'Notas' },
    { key: 'totalHoras', label: 'Total Horas' },
    { key: 'horarioLaboral', label: 'Horario Laboral' }
];

export const PAGINATION_CONFIG = {
    entriesPerPage: 6,
    maxPagesToShow: 5
};

// Estos valores podrían venir del backend en el futuro
export const USER_SCHEDULE_INFO = {
    weeklyHoursTarget: 40,
    dailyHoursTarget: 8,
    currentWeekWorkedHours: 32,
    averageDailyHours: 7.5
};

// Estados de fichaje
export const CLOCK_STATES = {
    ON_TIME: 'on_time',
    LATE: 'late',
    VERY_LATE: 'very_late',
    ABSENT: 'absent'
};

// Tipos de entrada
export const ENTRY_TYPES = {
    NORMAL: 'normal',
    MANUAL: 'manual',
    AUTOMATIC: 'automatic'
}; 
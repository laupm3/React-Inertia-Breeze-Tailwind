/**
 * Calculate the total hours of a work week based on the schedule
 * @param {Array} esquema - Array of weekday objects with turno information
 * @returns {String} - Total hours formatted as "HH:MM"
 */
export const calculateTotalWeekHours = (esquema) => {
    if (!esquema || Object.keys(esquema).length === 0) {
        return '00:00';
    }
    
    let totalMinutes = 0;
    
    // Process all 7 days of the week (Monday to Sunday)
    Object.values(esquema).forEach(day => {
        if (!day.turno) return;
        
        const start = day.turno.horaInicio?.split(':').map(Number);
        const end = day.turno.horaFin?.split(':').map(Number);
        
        if (!start || !end) return;
        
        let minutes = (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);
        if (minutes < 0) minutes += 24 * 60; // Handle overnight shifts
        
        if (day.turno.descansoInicio && day.turno.descansoFin) {
            const breakStart = day.turno.descansoInicio.split(':').map(Number);
            const breakEnd = day.turno.descansoFin.split(':').map(Number);
            const breakMinutes = (breakEnd[0] * 60 + breakEnd[1]) - (breakStart[0] * 60 + breakStart[1]);
            minutes -= breakMinutes > 0 ? breakMinutes : 0;
        }
        
        totalMinutes += minutes;
    });
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

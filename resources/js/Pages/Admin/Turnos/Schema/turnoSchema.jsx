import { z } from "zod";

/**
 * turno schema - Define the schema for the turno object
 * 
 * @param {Object} turno The turno object
 * @param {string} turno.nombre The name of the turno
 * @param {string} turno.color The color of the turno
 * @param {string} turno.hora_inicio The hora_inicio of the turno
 * @param {string} turno.hora_fin The hora_fin of the turno
 * @param {number} turno.centro_id The centro_id of the turno
 * @param {string} turno.descripcion The descripcion of the turno
 * @param {string} turno.descanso_inicio The descanso_inicio of the turno
 * @param {string} turno.descanso_fin The descanso_fin of the turno
 */

const turnoSchema = (t) => z.object({
    nombre: z.string().min(1, t ? t('validation.required', { field: 'nombre' }) : 'El nombre es requerido'),
    color: z.string().optional(),
    hora_inicio: z.string().min(1, t ? t('validation.required', { field: 'hora de inicio' }) : 'La hora de inicio es requerida'),
    hora_fin: z.string().min(1, t ? t('validation.required', { field: 'hora de fin' }) : 'La hora de fin es requerida'),
    centro_id: z.number({ message: t ? t('validation.required', { field: 'centro' }) : 'El centro es requerido' }),
    descripcion: z.string().optional(),
    descanso_inicio: z.string().optional(),
    descanso_fin: z.string().optional(),
});

export default turnoSchema;

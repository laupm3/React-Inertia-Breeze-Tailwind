import { z } from 'zod';
import { useTranslation } from 'react-i18next';

/**
 * Creates a Zod schema for validating solicitud permiso data. It uses the `useTranslation` hook to get translation functions for error messages.
 * 
 * @returns {z.ZodObject} Zod schema for solicitud permiso creation and update
 */
const useModelSchema = () => {
    const { t } = useTranslation(['datatable']);

    return z.object({
        id: z.nullable(z.number({ message: 'El ID es obligatorio' })),
        empleado_id: z.number({ message: 'El empleado es obligatorio' }),
        permiso_id: z.number({ message: 'El tipo de permiso es obligatorio' }),
        fecha_inicio: z.string().min(1, { message: 'La fecha de inicio es obligatoria' }),
        fecha_fin: z.string().min(1, { message: 'La fecha de fin es obligatoria' }),
        hora_inicio: z.string().optional(),
        hora_fin: z.string().optional(),
        motivo: z.string().optional(),
        dia_completo: z.boolean().default(false),
        recuperable: z.boolean().default(false),
        estado_id: z.number().default(1),
        files: z.array(z.any()).default([])
    }).refine((data) => {
        // Si no es día completo, las horas son obligatorias
        if (!data.dia_completo) {
            return data.hora_inicio && data.hora_fin && data.hora_inicio.trim() !== '' && data.hora_fin.trim() !== '';
        }
        return true;
    }, {
        message: "Las horas de inicio y fin son obligatorias cuando no es día completo",
        path: ["hora_inicio"]
    }).refine((data) => {
        // Validar que la fecha de fin no sea anterior a la fecha de inicio
        if (data.fecha_inicio && data.fecha_fin) {
            return new Date(data.fecha_fin) >= new Date(data.fecha_inicio);
        }
        return true;
    }, {
        message: "La fecha de fin no puede ser anterior a la fecha de inicio",
        path: ["fecha_fin"]
    });
};

const defaultValues = {
    id: null,
    empleado_id: null,
    permiso_id: null,
    fecha_inicio: '',
    fecha_fin: '',
    hora_inicio: '',
    hora_fin: '',
    motivo: '',
    dia_completo: false,
    recuperable: false,
    estado_id: 1,
    files: []
};

const testValues = {
    id: null,
    empleado_id: 1,
    permiso_id: 1,
    fecha_inicio: '2025-07-02',
    fecha_fin: '2025-07-02',
    hora_inicio: '09:00',
    hora_fin: '17:00',
    motivo: 'Solicitud de permiso de prueba para testing',
    dia_completo: false,
    recuperable: true,
    estado_id: 1,
    files: []
};

export {
    useModelSchema,
    defaultValues,
    testValues
}

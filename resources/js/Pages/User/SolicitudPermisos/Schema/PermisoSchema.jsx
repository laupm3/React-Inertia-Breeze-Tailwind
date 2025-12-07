import { z } from 'zod';
import { formatDate } from '@/Pages/User/SolicitudPermisos/Utils/dateUtils'; 

export const defaultPermisoValues = {
    permiso_id: null, 
    fecha_inicio: formatDate(new Date()),
    fecha_fin: formatDate(new Date()),
    hora_inicio: '',
    hora_fin: '',
    motivo: '',
    dia_completo: false,
    files: [], 
    recuperable: false,
    estado_id: 1,
};

export const permisoFormSchema = z.object({
    permiso_id: z.coerce.number({
        invalid_type_error: "Debe seleccionar un tipo de permiso.",
        required_error: "Debe seleccionar un tipo de permiso."
    }).int("ID de permiso debe ser un entero.").positive("Debe seleccionar un tipo de permiso.").nullable().refine(val => val !== null, "Debe seleccionar un tipo de permiso."),
    fecha_inicio: z.string()
        .min(1, "La fecha de inicio es requerida.")
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha de inicio inválido (YYYY-MM-DD)."),
    fecha_fin: z.string()
        .min(1, "La fecha de fin es requerida.")
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha de fin inválido (YYYY-MM-DD)."),
    hora_inicio: z.string().optional(), 
    hora_fin: z.string().optional(),   
    motivo: z.string().min(1, "El motivo es requerido.").max(1000, "El motivo no puede exceder los 1000 caracteres."),
    dia_completo: z.boolean(),
    files: z.array(z.instanceof(File))
        .optional()
        .default([]),
    recuperable: z.boolean(),
    estado_id: z.number().int().positive("El estado es inválido."),
}).superRefine((data, ctx) => {
    // Determinar si es un solo día
    const isSingleDay = data.fecha_inicio === data.fecha_fin;
    
    // Validar hora_inicio y hora_fin solo si es un solo día y NO es día completo
    if (isSingleDay && !data.dia_completo) {
        if (!data.hora_inicio) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['hora_inicio'], message: 'La hora de inicio es requerida si no es día completo.' });
        } else if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(data.hora_inicio)) { // Formato HH:MM (24h)
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['hora_inicio'], message: 'Formato de hora de inicio inválido (HH:MM).' });
        }

        if (!data.hora_fin) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['hora_fin'], message: 'La hora de fin es requerida si no es día completo.' });
        } else if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(data.hora_fin)) { // Formato HH:MM (24h)
            ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['hora_fin'], message: 'Formato de hora de fin inválido (HH:MM).' });
        }

        // Validar que hora_fin sea posterior a hora_inicio
        if (data.hora_inicio && data.hora_fin && /^([01]\d|2[0-3]):([0-5]\d)$/.test(data.hora_inicio) && /^([01]\d|2[0-3]):([0-5]\d)$/.test(data.hora_fin)) {
            if (data.hora_fin <= data.hora_inicio) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['hora_fin'], message: 'La hora de fin debe ser posterior a la hora de inicio.' });
            }
        }
    }
    // Para múltiples días, automáticamente se considera día completo, no validar horas

    // Validar que fecha_fin no sea anterior a fecha_inicio
    if (data.fecha_inicio && data.fecha_fin) {
        const startDateValid = /^\d{4}-\d{2}-\d{2}$/.test(data.fecha_inicio);
        const endDateValid = /^\d{4}-\d{2}-\d{2}$/.test(data.fecha_fin);

        if (startDateValid && endDateValid) {
            // Añadir hora para evitar problemas de zona horaria al comparar solo fechas
            const startDate = new Date(data.fecha_inicio + "T00:00:00");
            const endDate = new Date(data.fecha_fin + "T00:00:00");
            if (endDate < startDate) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['fecha_fin'], message: 'La fecha de fin no puede ser anterior a la fecha de inicio.' });
            }
        }
    }
});

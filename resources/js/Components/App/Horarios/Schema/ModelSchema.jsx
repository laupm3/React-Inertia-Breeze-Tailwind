import { z } from 'zod';

/**
 * Creates a Zod schema for validating employee data. It uses the `useTranslation` hook to get translation functions for error messages.
 * 
 * @returns {z.ZodObject} Zod schema for employee creation and update
 */
const useModelSchema = () => {
    const schema = z.object({
        id: z.number().nullable().or(z.string().nullable()).optional(),
        turno_id: z.number().nullable().or(z.string().nullable()),
        modalidad_id: z.number().nullable().or(z.string().nullable()),
        estado_horario_id: z.number().nullable().or(z.string().nullable()),
        horario_inicio: z.string().min(1, 'Horario de inicio requerido'),
        horario_fin: z.string().min(1, 'Horario de fin requerido'),
        descanso_inicio: z.string().optional(),
        descanso_fin: z.string().optional(),
        observaciones: z.string().optional(),
        contrato_id: z.number().nullable().or(z.string().nullable()).optional(),
        anexo_id: z.number().nullable().or(z.string().nullable()).optional(),
    }).passthrough(); // ✅ Esto permite campos extra sin error


    return z.array(schema);
};


const defaultValues = [
    {
        id: null,
        contrato_id: null,
        anexo_id: null,
        turno_id: null,
        modalidad_id: null,
        estado_horario_id: 1,
        horario_inicio: '',
        horario_fin: '',
        descanso_inicio: '',
        descanso_fin: '',
        observaciones: '',
    }
];

export {
    useModelSchema,
    defaultValues
}


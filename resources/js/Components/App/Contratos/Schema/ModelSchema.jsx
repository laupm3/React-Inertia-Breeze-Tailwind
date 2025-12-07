import { z } from 'zod';
import { useTranslation } from 'react-i18next';

/**
 * Creates a Zod schema for validating employee data. It uses the `useTranslation` hook to get translation functions for error messages.
 * 
 * @returns {z.ZodObject} Zod schema for employee creation and update
 */
const useModelSchema = () => {
    const { t } = useTranslation(['datatable']);

    return z.object({
        id: z.any().nullable(),
        n_expediente: z.string().nonempty({ message: 'El número de expediente es obligatorio' }),
        tipo_contrato_id: z.number(),
        asignacion_id: z.number(),
        fecha_inicio: z.string().nonempty({ message: 'La fecha de inicio es obligatoria' }),
        fecha_fin: z.union([z.string(), z.null()]).optional(),
        empresa_id: z.number(),
        centro_id: z.number(),
        departamento_id: z.number(),
        empleado_id: z.number(),
        jornada_id: z.union([z.number(), z.string().min(0)]).refine(val => val !== '' || typeof val === 'number', {
            message: 'La jornada es obligatoria'
        }),
    })
};

const defaultValues = {
    id: null,
    n_expediente: '',
    tipo_contrato_id: null,
    asignacion_id: null,
    fecha_inicio: '',
    fecha_fin: null,
    empresa_id: null,
    centro_id: null,
    departamento_id: null,
    empleado_id: null,
    jornada_id: ''
};

export {
    useModelSchema,
    defaultValues
}
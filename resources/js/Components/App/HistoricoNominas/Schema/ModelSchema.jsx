import { z } from 'zod';
import { useTranslation } from 'react-i18next';

/**
 * Creates a Zod schema for validating payroll history data.
 *
 * @returns {z.ZodObject} Zod schema for payroll history creation and update
 */
const useModelSchema = () => {
    const { t } = useTranslation(['datatable']);

    return z.object({
        id: z.nullable(z.number()),
        nombre: z.string().nonempty({ message: 'El nombre del archivo es requerido' }),
        user: z.any().refine(val => val, { message: 'El empleado vinculado es requerido' }),
        created_at: z.string().optional(),
        created_by: z.any().optional(),
        updated_by: z.any().optional(),
        archivo: z.instanceof(File).nullable(),
    }).superRefine((data, ctx) => {
        if (!data.id && !data.archivo) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['archivo'],
                message: 'El archivo es requerido al crear un nuevo registro.',
            });
        }
    });
};

const defaultValues = {
    id: null,
    nombre: '',
    user: null,
    created_at: '',
    created_by: null,
    updated_by: null,
    archivo: null,
};

export {
    useModelSchema,
    defaultValues
}
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
        photo: z.any().nullable(),
        name: z.string().nonempty('El nombre es un campo obligatorio'),
        email: z.string().email('El email debe ser un email válido'),
        empleado_id: z.number().nullable().optional(),
        role_id: z.number().nullable().refine(val => val !== null, 'El rol es un campo obligatorio'),
        status: z.number(),
        status_initial_date: z.union([
            z.date(),
            z.string().transform((val) => {
                if (!val) return null;
                const date = new Date(val);
                return isNaN(date.getTime()) ? null : date;
            }),
            z.null()
        ]).nullable().optional(),
        status_final_date: z.union([
            z.date(),
            z.string().transform((val) => {
                if (!val) return null;
                const date = new Date(val);
                return isNaN(date.getTime()) ? null : date;
            }),
            z.null()
        ]).nullable().optional(),
        user_timezone: z.string().nullable().optional(),
    })
};

const defaultValues = {
    id: null,
    photo: null,
    name: '',
    email: '',
    empleado_id: null,
    role_id: null,
    status: 3, // PENDING, default status
    status_initial_date: null,
    status_final_date: null,
    user_timezone: null,
};

export {
    useModelSchema,
    defaultValues
}
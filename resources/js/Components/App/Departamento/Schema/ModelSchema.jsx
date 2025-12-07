import { z } from 'zod';

/**
 * Creates a Zod schema for validating employee data. It uses the `useTranslation` hook to get translation functions for error messages.
 * 
 * @returns {z.ZodObject} Zod schema for employee creation and update
 */
const useModelSchema = () => {
    return z.object({
    id: z.nullable(z.number({ message: 'El ID es requerido' })),
    nombre: z.string().nonempty({ message: 'El nombre es requerido' }),
    manager_id: z.union([z.number(), z.null()]).refine(val => val !== null, { message: 'El manager es requerido' }),
    adjunto_id: z.union([z.number(), z.null()]),
    descripcion: z.string().optional(),
    parent_department_id: z.union([z.number(), z.null()]).optional(),
    })
};

const defaultValues = {
    id: null,
    nombre: '',
    manager_id: null,
    adjunto_id: null,
    descripcion: '',
    parent_department_id: null
};

export {
    useModelSchema,
    defaultValues
}
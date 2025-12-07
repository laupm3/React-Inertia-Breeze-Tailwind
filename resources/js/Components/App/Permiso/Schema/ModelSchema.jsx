import { z } from 'zod';

/**
 * Creates a Zod schema for validating employee data. It uses the `useTranslation` hook to get translation functions for error messages.
 * 
 * @returns {z.ZodObject} Zod schema for employee creation and update
 */
const useModelSchema = () => {
    return z.object({
        id: z.any().nullable(),
        name: z.string().min(2),
        module_id: z.number(),
        description: z.string().min(2).max(255),
    })
};

const defaultValues = {
    id: null,
    name: '',
    module_id: null,
    description: ''
};

export {
    useModelSchema,
    defaultValues
}
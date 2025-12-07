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
        name: z.string().min(2),
        description: z.string().min(2).max(255),
    })
};

const defaultValues = {
    id: null,
    name: '',
    description: '',
};

export {
    useModelSchema,
    defaultValues
}
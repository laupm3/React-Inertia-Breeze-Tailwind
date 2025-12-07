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
        id: z.number().optional().nullable(),
        name: z.string().min(1, t('validation.required', { field: 'nombre' })),
        description: z.string().optional().nullable(),
        esquema: z.array(
            z.object({
                weekday_number: z.number(),
                turno_id: z.number().nullable().optional(),
                modalidad_id: z.number().nullable().optional()
            }).refine((data) => {
                // Si hay turno_id, debe haber modalidad_id
                if (data.turno_id && !data.modalidad_id) {
                    return false;
                }
                // Si hay modalidad_id, debe haber turno_id
                if (data.modalidad_id && !data.turno_id) {
                    return false;
                }
                return true;
            }, {
                message: "Turno y modalidad deben seleccionarse juntos",
                path: ["turno_modalidad"]
            })
        ).optional()
    })
};

const defaultValues = {
    id: null,
    name: '',
    description: '',
    esquema: [],
};

export {
    useModelSchema,
    defaultValues
}
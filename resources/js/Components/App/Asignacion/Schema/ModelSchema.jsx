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
        id: z.nullable(z.number()),
        nombre: z.string().nonempty({ message: t('dialog.nombre') }),
        descripcion: z.string().nonempty({ message: t('dialog.descripcion') }),
    })
};

const defaultValues = {
    id: null,
    nombre: '',
    descripcion: ''
};

const testValues = {
    id: 1,
    nombre: 'Asignación de prueba',
    descripcion: 'Descripción de prueba para la asignación'
}

export {
    useModelSchema,
    defaultValues,
    testValues
}
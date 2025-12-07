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
        nombre: z.string().min(1, t ? t('validation.required', { field: 'nombre' }) : 'El nombre es requerido'),
        color: z.string().optional(),
        hora_inicio: z.string().min(1, t ? t('validation.required', { field: 'hora de inicio' }) : 'La hora de inicio es requerida'),
        hora_fin: z.string().min(1, t ? t('validation.required', { field: 'hora de fin' }) : 'La hora de fin es requerida'),
        centro_id: z.number({ message: t ? t('validation.required', { field: 'centro' }) : 'El centro es requerido' }),
        descripcion: z.string().optional(),
        descanso_inicio: z.string().optional(),
        descanso_fin: z.string().optional(),
    })
};

const defaultValues = {
    id: null,
    nombre: '',
    color: '',
    hora_inicio: '',
    hora_fin: '',
    centro_id: null,
    descripcion: '',
    descanso_inicio: '',
    descanso_fin: ''
};

export {
    useModelSchema,
    defaultValues
}
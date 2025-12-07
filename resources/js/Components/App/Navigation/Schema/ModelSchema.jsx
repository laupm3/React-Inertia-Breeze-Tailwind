import { z } from 'zod';
import { useTranslation } from 'react-i18next';

/**
 * Creates a Zod schema for validating navigation data. It uses the `useTranslation` hook to get translation functions for error messages.
 * 
 * @returns {z.ZodObject} Zod schema for navigation creation and update
 */
const useModelSchema = () => {
    const { t } = useTranslation(['datatable']);

    return z.object({
        id: z.nullable(z.number()).optional(),
        name: z.string().min(1, { message: 'El nombre es requerido' }),
        description: z.string().optional().or(z.literal('')),
        icon: z.string().min(1, { message: 'El ícono es requerido' }),
        route_name: z.string().optional().or(z.literal('')),
        parent_id: z.nullable(z.number()).optional(),
        permission_id: z.nullable(z.number()).optional(),
        weight: z.number().min(1).max(5).default(1),
        is_important: z.boolean().default(false),
        is_recent: z.boolean().default(false),
    });
};

const defaultValues = {
    id: null,
    name: '',
    description: '',
    icon: 'MapPin',
    route_name: '',
    parent_id: null,
    permission_id: null,
    weight: 1,
    is_important: false,
    is_recent: false,
};

const testValues = {
    id: null,
    name: "Dashboard Principal",
    description: "Panel de control principal para administración del sistema",
    icon: "LayoutDashboard",
    route_name: "/admin/dashboard",
    parent_id: null,
    permission_id: 1,
    weight: 5,
    is_important: true,
    is_recent: true,
}

export {
    useModelSchema,
    defaultValues,
    testValues
}
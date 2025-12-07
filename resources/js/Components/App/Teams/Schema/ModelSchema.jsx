import { z } from 'zod';

/**
 * Creates a Zod schema for validating team data. It uses the `useTranslation` hook to get translation functions for error messages.
 * 
 * @returns {z.ZodObject} Zod schema for team creation and update
 */
const useModelSchema = () => {

    return z.object({
        id: z.nullable(z.number()),
        name: z.string().nonempty({ message: 'El nombre es obligatorio' }),
        description: z.string().nonempty({ message: 'La descripción es obligatoria' }),
        icon: z.string().nonempty({ message: 'El icono es obligatorio' }),
        bg_color: z.string().nonempty({ message: 'El color de fondo es obligatorio' }),
        icon_color: z.string().nonempty({ message: 'El color del icono es obligatorio' }),
        personal_team: z.boolean(),
        owner: z.object({
            id: z.number(),
            name: z.string(),
            email: z.string(),
            profile_photo_url: z.string(),
            profile_photo_path: z.string(),
            empleado: z.nullable(z.any()),
            role: z.nullable(z.any()),
            departamentos: z.nullable(z.array(z.any())),
            centros: z.nullable(z.array(z.any())),
            asignaciones: z.nullable(z.array(z.any())),
            contratos: z.nullable(z.array(z.any())),
            membership: z.nullable(z.any())
        }),
        users: z.array(z.any()),
        teamInvitations: z.array(z.any())
    })
};

const defaultValues = {
    id: null,
    name: '',
    description: '',
    icon: 'Box',
    bg_color: '#16b83a',
    icon_color: '#ed703b',
    personal_team: false,
    owner: {
        id: 0,
        name: '',
        email: '',
        profile_photo_url: '',
        profile_photo_path: '',
        empleado: null,
        role: null,
        departamentos: null,
        centros: null,
        asignaciones: null,
        contratos: null,
        membership: null
    },
    users: [],
    teamInvitations: []
};

export {
    useModelSchema,
    defaultValues
}

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
        nombre: z.string().nonempty({ message: 'El nombre es requerido' }),
        primer_apellido: z.string().nonempty({ message: 'El primer apellido es requerido' }),
        segundo_apellido: z.string().nonempty({ message: 'El segundo apellido es requerido' }),
        nif: z.string().nonempty({ message: 'El NIF es requerido' }),
        caducidad_nif: z.string().nonempty({ message: 'La fecha de caducidad es requerida' }),
        tipo_empleado_id: z.coerce.number().refine(val => val !== null, { message: 'El tipo de empleado es requerido' }),
        genero_id: z.coerce.number().refine(val => val !== null, { message: 'El genero es requerido' }),
        estado_id: z.coerce.number().refine(val => val !== null, { message: 'El estado es requerido' }),
        tipo_documento_id: z.coerce.number().refine(val => val !== null, { message: 'El tipo de documento es requerido' }),
        email: z.string().email({ message: 'El email debe ser un email valido' }),
        email_secundario: z.nullable(z.string()),
        telefono: z.string().nonempty({ message: 'El telefono es requerido' }),
        telefono_personal_movil: z.nullable(z.string()).optional(),
        telefono_personal_fijo: z.nullable(z.string()).optional(),
        extension_centrex: z.nullable(z.string()).optional(),
        fecha_nacimiento: z.string().nonempty({ message: 'La fecha de nacimiento es requerida' }),
        niss: z.string().nonempty({ message: 'El NISS es requerido' }),
        contacto_emergencia: z.nullable(z.string()),
        telefono_emergencia: z.nullable(z.string()),
        direccion: z.object({
            full_address: z.string().nonempty({ message: 'La dirección es requerida' }),
            latitud: z.any().optional().transform(val => val?.toString() || null),
            longitud: z.any().optional().transform(val => val?.toString() || null),
            codigo_postal: z.any().optional().transform(val => val?.toString() || null),
            numero: z.any().optional().transform(val => val?.toString() || null),
            piso: z.any().optional().transform(val => val?.toString() || null),
            puerta: z.any().optional().transform(val => val?.toString() || null),
            escalera: z.any().optional().transform(val => val?.toString() || null),
            bloque: z.any().optional().transform(val => val?.toString() || null)
        }),
        user_id: z.coerce.number().nullable(),
        create_user: z.boolean()
    })
};

const defaultValues = {
    id: null,
    nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    nif: '',
    caducidad_nif: '',
    tipo_empleado_id: '',
    genero_id: '',
    estado_id: '',
    tipo_documento_id: '',
    email: '',
    email_secundario: '',
    telefono: '',
    telefono_personal_movil: '',
    telefono_personal_fijo: '',
    extension_centrex: '',
    fecha_nacimiento: '',
    niss: '',
    contacto_emergencia: '',
    telefono_emergencia: '',
    direccion: {
        id: null,
        full_address: '',
        latitud: '',
        longitud: '',
        codigo_postal: '',
        numero: '',
        piso: '',
        puerta: '',
        escalera: '',
        bloque: ''
    },
    user_id: null,
    create_user: true
};

export {
    useModelSchema,
    defaultValues
}
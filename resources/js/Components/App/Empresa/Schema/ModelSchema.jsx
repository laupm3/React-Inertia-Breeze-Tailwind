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
        id: z.nullable(z.number({ message: 'El ID es obligatorio' })),
        nombre: z.string().nonempty({ message: 'El nombre es obligatorio' }),
        siglas: z.string().nonempty({ message: 'Las siglas son obligatorias' }),
        cif: z.string().nonempty({ message: 'El CIF es obligatorio' }),
        email: z.string().email({ message: 'El email debe ser valido' }),
        telefono: z.string().nonempty({ message: 'El teléfono es obligatorio' }),
        representante_id: z.union([z.number(), z.null()]).refine(val => val !== null, { message: 'El representante es obligatorio' }),
        adjunto_id: z.union([z.number(), z.null()]).refine(val => val !== null, { message: 'El adjunto es obligatorio' }),
        direccion: z.object({
            id: z.nullable(z.number({ message: 'El ID es obligatorio' })),
            full_address: z.string().nonempty({ message: 'La dirección es obligatoria' }),
            latitud: z.union([z.number(), z.string()]).refine(val => val !== null, { message: 'La latitud es obligatoria' }),
            longitud: z.union([z.number(), z.string()]).refine(val => val !== null, { message: 'La longitud es obligatoria' }),
            codigo_postal: z.string().nullable(),
            numero: z.string().nullable(),
            piso: z.string().nullable(),
            puerta: z.string().nullable(),
            escalera: z.string().nullable(),
            bloque: z.string().nullable(),
        })
    })
};

const defaultValues = {
    id: null,
    nombre: '',
    siglas: '',
    cif: '',
    email: '',
    telefono: '',
    representante_id: null,
    adjunto_id: null,
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
        bloque: '',
    },
};

const testValues = {
    id: null,
    nombre: "Centro de Formación Prueba",
    siglas: "CFP",
    cif: "FP12345678",
    email: "zelaya.iker@leyva.org",
    telefono: "983-040653",
    representante_id: 1,
    adjunto_id: 1,
    direccion: {
        id: null,
        full_address: "Carrer del Pescador, 46293, Valencia, España",
        latitud: 39.06374,
        longitud: -0.5459609,
        codigo_postal: "",
        numero: "",
        piso: "",
        puerta: "",
        escalera: "",
        bloque: ""
    },
}

export {
    useModelSchema,
    defaultValues,
    testValues
}
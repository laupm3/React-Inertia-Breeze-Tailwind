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
        id: z.nullable(z.number({ message: 'El ID es requerido' })),
        nombre: z.string().nonempty({ message: 'El nombre es requerido' }),
        email: z.string().email({ message: 'El email no es válido' }),
        telefono: z.string().nonempty({ message: 'El teléfono es requerido' }),
        empresa_id: z.union([z.number(), z.null()]).refine(val => val !== null, { message: 'La empresa es requerida' }),
        estado_id: z.union([z.number(), z.null()]).refine(val => val !== null, { message: 'El estado es requerido' }),
        coordinador_id: z.union([z.number(), z.null()]).refine(val => val !== null, { message: 'El coordinador es requerido' }),
        responsable_id: z.union([z.number(), z.null()]).refine(val => val !== null, { message: 'El responsable es requerido' }),
        direccion: z.object({
            id: z.nullable(z.number({ message: 'El ID es requerido' })),
            full_address: z.string().nonempty({ message: 'La dirección es requerida' }),
            latitud: z.union([z.number(), z.string()]).refine(val => val !== null, { message: 'La latitud es requerida' }),
            longitud: z.union([z.number(), z.string()]).refine(val => val !== null, { message: 'La longitud es requerida' }),
            codigo_postal: z.string().nullable(),
            numero: z.string().nullable(),
            piso: z.string().nullable(),
            puerta: z.string().nullable(),
            escalera: z.string().nullable(),
            bloque: z.string().nullable(),
        })
    });
};

const defaultValues = {
    id: null,
    nombre: '',
    email: '',
    telefono: '',
    empresa_id: null,
    estado_id: null,
    responsable_id: null,
    coordinador_id: null,
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
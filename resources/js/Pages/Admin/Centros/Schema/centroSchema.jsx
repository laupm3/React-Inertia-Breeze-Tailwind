import { z } from 'zod';

/**
 * Centro schema - Define the schema for the centro object
 * 
 * @param {Object} centro The centro object
 * @param {string} centro.nombre The name of the centro
 * @param {string} centro.email The email of the centro
 * @param {string} centro.telefono The phone number of the centro
 * @param {number} centro.coordinador_id The id of the centro's coordinator
 * @param {number} centro.administrador_id The id of the centro's administrator
 * @param {number} centro.empresa_id The id of the centro's company
 * @param {number} centro.estado_id The id of the centro's status
 * @param {Array} centro.departamento_ids The ids of the centro's departments
 * @param {Object} centro.direccion The address object of the centro
 * @param {number} centro.direccion.id The id of the address
 * @param {string} centro.direccion.full_address The full address of the centro
 * @param {number} centro.direccion.latitud The latitude of the centro
 * @param {number} centro.direccion.longitud The longitude of the centro
 * @param {string} centro.direccion.codigo_postal The postal code of the centro
 * @param {string} centro.direccion.numero The number of the centro
 * @param {string} centro.direccion.piso The floor of the centro
 * @param {string} centro.direccion.puerta The door of the centro
 * @param {string} centro.direccion.escalera The stairs of the centro
 * @param {string} centro.direccion.bloque The block of the centro
 */
const centroSchema = (t) => z.object({
    id: z.nullable(z.number({ message: t('dialog.id') })),
    nombre: z.string().nonempty(t('dialog.nombre')),
    email: z.string().email(t('dialog.email')),
    telefono: z.string().nonempty(t('dialog.telefono')),
    empresa_id: z.union([z.number(), z.null()]).refine(val => val !== null, { message: t('dialog.empresa') }),
    estado_id: z.union([z.number(), z.null()]).refine(val => val !== null, { message: t('dialog.estado') }),
    coordinador_id: z.union([z.number(), z.null()]).refine(val => val !== null, { message: t('dialog.coordinador') }),
    responsable_id: z.union([z.number(), z.null()]).refine(val => val !== null, { message: t('dialog.responsable') }),
    direccion: z.object({
        id: z.nullable(z.number({ message: t('dialog.id') })),
        full_address: z.string().nonempty({ message: t('dialog.direccion') }),
        latitud: z.union([z.number(), z.string()]).refine(val => val !== null, { message: t('dialog.latitud') }),
        longitud: z.union([z.number(), z.string()]).refine(val => val !== null, { message: t('dialog.longitud') }),
        codigo_postal: z.string().nullable(),
        numero: z.string().nullable(),
        piso: z.string().nullable(),
        puerta: z.string().nullable(),
        escalera: z.string().nullable(),
        bloque: z.string().nullable(),
    }),
});

export default centroSchema;
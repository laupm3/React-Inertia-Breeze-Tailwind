import { z } from 'zod';

/**
 * Centro schema - Define the schema for the centro object
 * 
 * @param {Object} centro The centro object
 * @param {string} centro.nombre The name of the centro
 * @param {number} centro.manager_id The manager of the centro
 * @param {number} centro.adjunto_id The adjunto of the centro
 * @param {string} centro.descripcion The descripcion of the centro
 */

const DepartmentSchema = (t) => z.object({
    id: z.nullable(z.number({ message: t('dialog.id') })),
    nombre: z.string().nonempty({ message: t('dialog.nombre') }),
    manager_id: z.union([z.number(), z.null()]).refine(val => val !== null, { message: t('dialog.manager') }),
    adjunto_id: z.union([z.number(), z.null()]),
    descripcion: z.string().optional(),
    parent_department_id: z.union([z.number(), z.null()]).optional(),

});

export default DepartmentSchema;
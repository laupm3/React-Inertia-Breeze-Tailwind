import { z } from "zod";

/**
* Jornada schema - Define the schema for the Jornada object
* 
* @param {Object} jornada The jornada object
* @param {string} jornada.name The name of the jornada
* @param {string} jornada.description The description of the jornada
* @param {Array} jornada.esquema The esquema of the jornada
* @param {number} jornada.esquema.weekday_number The weekday number of the jornada
* @param {number|null} jornada.esquema.turno_id The turno ID
* @param {number|null} jornada.esquema.modalidad_id The modalidad ID
*/

export const jornadasSchema = (t) => {
  return z.object({
    id: z.number().optional().nullable(),
    name: z.string().min(1, t('validation.required', { field: 'nombre' })),
    description: z.string().optional().nullable(),
    esquema: z.array(
      z.object({
        weekday_number: z.number(),
        turno_id: z.number().nullable().optional(),
        modalidad_id: z.number().nullable().optional()
      })
    ).optional()
  });
}

export default jornadasSchema;

import { z } from 'zod';

const userSchema = (t) => z.object({
  id: z.any().nullable(),
  name: z.string().min(2),
  description: z.string().min(2).max(255),
});

export default userSchema;

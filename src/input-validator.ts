import { z } from 'zod'

export const inputValidator = z.object({
  input: z.number().int().min(0).max(10),
})

export type InputPayload = z.infer<typeof inputValidator>

import { Request } from 'express'
import z, { AnyZodObject, ZodError } from 'zod'

import { BadReq } from './error.js'

export function parse<T extends AnyZodObject>(req: Request, schema: T): z.infer<T> {
  try {
    return schema.parse(req)
  } catch (err) {
    const error = err as ZodError
    throw BadReq(error.issues[0].message, { errors: error.issues })
  }
}

export function coerceArray(object: z.ZodTypeAny) {
  return z.preprocess((val) => {
    if (val === '' || val === undefined) return undefined
    return Array.isArray(val) ? val : [val]
  }, object)
}

export function strictCoerceBoolean(object: z.ZodTypeAny) {
  return z.preprocess((val) => (val === 'true' ? true : val === 'false' ? false : undefined), object)
}

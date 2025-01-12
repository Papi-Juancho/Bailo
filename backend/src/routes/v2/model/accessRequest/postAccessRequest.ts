import bodyParser from 'body-parser'
import { Request, Response } from 'express'
import { z } from 'zod'

import { AccessRequestInterface } from '../../../../models/v2/AccessRequest.js'
import { createAccessRequest } from '../../../../services/v2/accessRequest.js'
import { parse } from '../../../../utils/validate.js'

const knownOverview = z.object({
  name: z.string(),
  endDate: z.string().optional(),
  entities: z.array(z.string()),
})

const overview = z.intersection(knownOverview, z.record(z.unknown()))

const KnownMetadata = z.object({
  overview,
})

export const accessRequestMetadata = z.intersection(KnownMetadata, z.record(z.unknown()))

export const postAccessRequestSchema = z.object({
  params: z.object({
    modelId: z.string(),
  }),
  body: z.object({
    schemaId: z.string(),
    metadata: accessRequestMetadata,
  }),
})

interface PostAccessRequest {
  accessRequest: AccessRequestInterface
}

export const postAccessRequest = [
  bodyParser.json(),
  async (req: Request, res: Response<PostAccessRequest>) => {
    const {
      params: { modelId },
      body,
    } = parse(req, postAccessRequestSchema)

    const accessRequest = await createAccessRequest(req.user, modelId, body)

    return res.json({
      accessRequest,
    })
  },
]

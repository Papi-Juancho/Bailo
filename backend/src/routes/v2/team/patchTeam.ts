import bodyParser from 'body-parser'
import { Request, Response } from 'express'
import { z } from 'zod'

import { TeamInterface } from '../../../models/v2/Team.js'
import { parse } from '../../../utils/validate.js'

export const patchTeamSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
  }),
  params: z.object({
    teamId: z.string({
      required_error: 'Must specify team id as URL parameter',
    }),
  }),
})

interface PatchTeamResponse {
  team: TeamInterface
}

export const patchTeam = [
  bodyParser.json(),
  async (req: Request, res: Response<PatchTeamResponse>) => {
    const _ = parse(req, patchTeamSchema)

    return res.json({
      team: {
        id: 'example-team',

        name: 'Example Team',
        description: 'An example Bailo team',

        deleted: false,

        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
  },
]

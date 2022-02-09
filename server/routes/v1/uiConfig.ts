import { ensureUserRole } from '../../utils/user'
import config from 'config'
import { Request, Response } from 'express'
import { NotFound } from 'server/utils/result'

export const getUiConfig = [
  ensureUserRole('user'),
  async (req: Request, res: Response) => {
    const uiConfig = await config.get('uiConfig')

    if (!uiConfig) {
      throw NotFound({}, `Unable to find UI Config`)
    }

    return res.json(uiConfig)
  },
]

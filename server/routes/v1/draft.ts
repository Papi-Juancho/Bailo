import { Request, Response } from 'express'
import { ensureUserRole } from '../../utils/user'
import { BadReq, NotFound } from '../../utils/result'
import { isValidUse, findUserDrafts, findDraftById, deleteDraftById, updateDraftById, createDraft } from '../../services/draft'
import bodyParser from 'body-parser'
import { Draft } from '../../models/Draft'

export const getDrafts = [
  ensureUserRole('user'),
  async (req: Request, res: Response) => {
    const { use } = req.query

    if (!isValidUse(use)) {
      throw NotFound({ code: 'use_field_missing_in_request' }, `Requires 'use' field to be provided`)
    }

    const drafts = await findUserDrafts(req.user!, use)

    req.log.info({ code: 'fetching_drafts', drafts }, 'User fetching all drafts')

    return res.json({
      drafts,
    })
  },
]

export const getDraft = [
  ensureUserRole('user'),
  async (req: Request, res: Response) => {
    const { id } = req.params

    const draft = await findDraftById(req.user!, id)

    req.log.info({ code: 'fetching_draft', draft, id }, 'User fetching a draft')

    return res.json({
      draft,
    })
  },
]

export const deleteDraft = [
  ensureUserRole('user'),
  async (req: Request, res: Response) => {
    const { id } = req.params

    req.log.info({ code: 'deleting_draft', id }, 'User deleting a draft')
    await deleteDraftById(req.user!, id)


    return res.json({
      message: 'Successfully removed draft',
    })
  },
]

export const updateDraft = [
  ensureUserRole('user'),
  bodyParser.json(),
  async (req: Request, res: Response) => {
    const { id } = req.params
    const { draft, schemaRef } = req.body

    req.log.info({ code: 'updating_draft', id }, 'User updating a draft')
    await updateDraftById(req.user!, id, schemaRef, draft)


    return res.json({
      message: 'Successfully updated draft',
    })
  },
]

export const postDraft = [
  ensureUserRole('user'),
  bodyParser.json(),
  async (req: Request, res: Response) => {
    const { schemaRef, draft, use } = req.body

    if (!isValidUse(use)) {
      throw NotFound({ code: 'use_field_missing_in_request' }, `Requires 'use' field to be provided`)
    }

    const draftObj: Draft = {
      schemaRef,
      name: draft.highLevelDetails.name,

      draft,
      use,

      owner: req.user!._id
    } as unknown as Draft // we're missing created at fields

    const draftDoc = await createDraft(draft)

    return res.json({
      draft: draftDoc
    })
  }
]
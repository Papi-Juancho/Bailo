import { model, Types } from 'mongoose'

import { Forbidden, NotFound } from '../utils/result'
import { SerializerOptions } from '../utils/logger'
import DraftModel, { Draft } from '../models/Draft'
import { UserDoc } from '../models/User'

export function isValidUse(use: any): use is 'UPLOAD' | 'DEPLOYMENT' {
  return typeof use === 'string' && ['UPLOAD', 'DEPLOYMENT'].includes(use)
}

export function serializedDraftFields(): SerializerOptions {
  return {
    mandatory: ['_id', 'schemaRef', 'name'],
  }
}

export async function findUserDrafts(user: UserDoc, use: string) {
  return DraftModel.find({
    owner: user._id,
    use
  })
}

export async function findDraftById(user: UserDoc, _id: Types.ObjectId | string) {
  const doc = await DraftModel.findById(_id)

  if (!doc) {
    throw NotFound({ user, _id }, 'Unable to find draft, draft not found.')
  }

  if (doc.owner !== user._id) {
    throw Forbidden({ user, _id }, 'Unable to delete draft, invalid user.')
  }

  return doc
}

export async function deleteDraftById(user: UserDoc, _id: Types.ObjectId) {
  const doc = await DraftModel.findById(_id)

  if (!doc) {
    throw NotFound({ user, _id }, 'Unable to find draft, draft not found.')
  }

  if (doc.owner !== user._id) {
    throw Forbidden({ user, _id }, 'Unable to delete draft, invalid user.')
  }

  await doc.remove()
}

export async function updateDraftById(user: UserDoc, _id: Types.ObjectId, schemaRef: string, newDraft: any) {
  const doc = await DraftModel.findById(_id)

  if (!doc) {
    throw NotFound({ user, _id }, 'Unable to find draft, draft not found.')
  }

  if (doc.owner !== user._id) {
    throw Forbidden({ user, _id }, 'Unable to update draft, invalid user.')
  }

  doc.draft = newDraft
  doc.markModified('draft')

  doc.schemaRef = schemaRef
  doc.name = newDraft.highLevelDetails.name

  await doc.save()
}

export async function createDraft(draft: Draft) {
  const draftDoc = new DraftModel(draft)
  return draftDoc.save()
}
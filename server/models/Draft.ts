import { Schema, model, Document, Types } from 'mongoose'
import { UserDoc } from './User'

export interface Draft {
  schemaRef: string
  name: string

  draft: any
  use: string

  owner: UserDoc | Types.ObjectId

  createdAt: Date
  updatedAt: Date
}

export type DraftDoc = Draft & Document<any, any, Draft>

const DraftSchema = new Schema<Draft>(
  {
    schemaRef: { type: String, required: true },
    name: { type: String, required: true },

    draft: { type: Schema.Types.Mixed },
    use: { type: String, required: true, enum: ['UPLOAD', 'DEPLOYMENT'] },

    owner: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  },
  {
    timestamps: true,
  }
)

const DraftModel = model<Draft>('Draft', DraftSchema)

export default DraftModel

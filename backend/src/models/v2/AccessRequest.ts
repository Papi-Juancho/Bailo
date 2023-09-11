import { Document, model, Schema } from 'mongoose'
import MongooseDelete from 'mongoose-delete'

// This interface stores information about the properties on the base object.
// It should be used for plain object representations, e.g. for sending to the
// client.
export interface AccessRequestInterface {
  id: string
  schemaRef: string

  metadata: unknown

  deleted: boolean

  createdAt: Date
  updatedAt: Date
}

// The doc type includes all values in the plain interface, as well as all the
// properties and functions that Mongoose provides.  If a function takes in an
// object from Mongoose it should use this interface
export type AccessRequestDoc = AccessRequestInterface & Document<any, any, AccessRequestInterface>

const AccessRequestSchema = new Schema<AccessRequestInterface>(
  {
    id: { type: String, required: true, unique: true, index: true },
    schemaRef: { type: String, required: true },

    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    collection: 'v2_access_requests',
  }
)

AccessRequestSchema.plugin(MongooseDelete, {
  overrideMethods: 'all',
  deletedBy: true,
  deletedByType: String,
})

const AccessRequestModel = model<AccessRequestInterface>('v2_Access_Request', AccessRequestSchema)

export default AccessRequestModel
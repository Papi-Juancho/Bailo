import SchemaModel from '../models/Schema'
import { connectToMongoose, disconnectFromMongoose } from '../utils/database'

import minimal from './example_schemas/minimal_upload_schema.json'
;(async () => {
  await connectToMongoose()

  const schema = new SchemaModel({
    name: 'Minimal Schema v9',
    reference: '/Minimal/General/v9',
    schema: minimal,
    use: 'UPLOAD',
  })

  await schema.save()

  setTimeout(disconnectFromMongoose, 50)
})()

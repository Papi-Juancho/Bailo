import '../utils/mockMongo'
import { createSchema, findSchemaByRef, findSchemasByUse, serializedSchemaFields } from './schema'
import SchemaModel from '../models/Schema'
import _ from 'lodash'
import { uploadSchema, uploadSchema2, deploymentSchema } from '../utils/test/testModels'

describe('test schema service', () => {
  beforeEach(async () => {
    await SchemaModel.create(uploadSchema)
    await SchemaModel.create(uploadSchema2)
    await SchemaModel.create(deploymentSchema)
  })

  test('that the serializer returns the correct properties', () => {
    const properties = serializedSchemaFields()
    expect(properties.mandatory).toStrictEqual(['_id', 'reference', 'name', 'use'])
  })

  test('we can fetch schema by reference', async () => {
    const fetchedSchema: any = await findSchemaByRef('test-schema')
    expect(fetchedSchema).toBeTruthy()
    expect(fetchedSchema.name).toBe(uploadSchema.name)
  })

  test('we can find upload schemas with a limit of 1', async () => {
    const fetchedSchema = await findSchemasByUse('UPLOAD', 1)
    expect(fetchedSchema).toBeTruthy()
    expect(fetchedSchema.length).toBe(1)
  })

  test('that we can overwrite an existing schema with some new metadata', async () => {
    const updatedSchema = _.cloneDeep(uploadSchema)
    updatedSchema.schema.testProperty = 'test field'
    await createSchema(updatedSchema, true)
    const fetchedSchema: any = await findSchemaByRef('test-schema')
    expect(fetchedSchema).toBeTruthy()
    expect(fetchedSchema.schema.testProperty).toBe(updatedSchema.schema.testProperty)
  })
})
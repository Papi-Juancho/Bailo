import { describe, expect, test, vi } from 'vitest'

import { postSchemaSchema } from '../../../src/routes/v2/schema/postSchema.js'
import { createFixture, testPost } from '../../testUtils/routes.js'

vi.mock('../../../src/utils/user.js')
vi.mock('../../../src/utils/config.js')

const mockSchemaService = vi.hoisted(() => {
  return {
    addDefaultSchemas: vi.fn(),
    createSchema: vi.fn(),
  }
})
vi.mock('../../../src/services/v2/schema.js', () => mockSchemaService)

describe('routes > schema > postSchema', async () => {
  test('successfully stores the schema', async () => {
    const fixture = createFixture(postSchemaSchema)
    mockSchemaService.createSchema.mockResolvedValue(fixture.body)
    const res = await testPost(`/api/v2/schemas`, fixture)

    expect(res.statusCode).toBe(200)
    expect(res.body).matchSnapshot()
  })
})

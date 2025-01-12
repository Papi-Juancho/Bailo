import { describe, expect, test, vi } from 'vitest'

import { getFilesSchema } from '../../../../src/routes/v2/model/file/getFiles.js'
import { createFixture, testGet } from '../../../testUtils/routes.js'

vi.mock('../../../../src/utils/config.js')
vi.mock('../../../../src/utils/user.js')

const fileMock = vi.hoisted(() => {
  return {
    getFilesByModel: vi.fn(() => ['a', 'b'] as any),
  }
})
vi.mock('../../../../src/services/v2/file.js', () => fileMock)

describe('routes > files > getFiles', () => {
  test('200 > ok', async () => {
    const fixture = createFixture(getFilesSchema)
    const res = await testGet(`/api/v2/model/${fixture.params.modelId}/files`)

    expect(res.statusCode).toBe(200)
    expect(res.body).matchSnapshot()
  })
})

import { describe, expect, test, vi } from 'vitest'

import { getAccessRequestSchema } from '../../../../src/routes/v2/model/accessRequest/getAccessRequest.js'
import { createFixture, testGet } from '../../../testUtils/routes.js'

vi.mock('../../../../src/utils/config.js')
vi.mock('../../../../src/utils/user.js')

const accessRequestMock = vi.hoisted(() => {
  return {
    getAccessRequestById: vi.fn(() => undefined as any),
  }
})
vi.mock('../../../../src/services/v2/accessRequest.js', () => accessRequestMock)

describe('routes > accessRequest > getAccessRequest', () => {
  test('200 > ok', async () => {
    accessRequestMock.getAccessRequestById.mockResolvedValueOnce({ example: 'test' })

    const fixture = createFixture(getAccessRequestSchema)
    const res = await testGet(`/api/v2/model/anything/access-request/${fixture.params.accessRequestId}`)

    expect(res.statusCode).toBe(200)
    expect(res.body).matchSnapshot()
  })
})

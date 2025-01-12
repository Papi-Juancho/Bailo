import { describe, expect, test, vi } from 'vitest'

import AccessRequest from '../../../src/models/v2/AccessRequest.js'
import Release from '../../../src/models/v2/Release.js'
import Review from '../../../src/models/v2/Review.js'
import { requestReviewForAccessRequest, requestReviewForRelease } from '../../../src/services/v2/smtp/smtp.js'
import config from '../../../src/utils/v2/config.js'

vi.mock('../../../src/utils/v2/config.js', () => {
  return {
    __esModule: true,
    default: {
      app: {
        protocol: '',
        host: '',
        port: 3000,
      },

      smtp: {
        enabled: true,

        connection: {
          host: 'localhost',
          port: 1025,
          secure: false,
          auth: undefined,
          tls: {
            rejectUnauthorized: false,
          },
        },

        from: '"Bailo 📝" <bailo@example.org>',
      },
    },
  }
})

const logMock = vi.hoisted(() => ({
  info: vi.fn(),
  warn: vi.fn(),
}))
vi.mock('../../../src/services/v2/log.js', async () => ({
  default: logMock,
}))

const transporterMock = vi.hoisted(() => {
  return {
    sendMail: vi.fn(() => ({ messageId: 123 })),
  }
})
const nodemailerMock = vi.hoisted(() => ({
  createTransport: vi.fn(() => transporterMock),
}))
vi.mock('nodemailer', async () => ({
  default: nodemailerMock,
}))

const authorisationMock = vi.hoisted(() => ({
  getUserInformationList: vi.fn(() => [Promise.resolve({ email: 'email@email.com' })]),
}))
vi.mock('../../../src/connectors/v2/authorisation/index.js', async () => ({ default: authorisationMock }))

const emailBuilderMock = vi.hoisted(() => ({
  buildEmail: vi.fn(() => ({ subject: 'subject', text: 'text', html: 'html' })),
}))
vi.mock('../../../src/services/v2/smtp/emailBuilder.js', async () => emailBuilderMock)

describe('services > smtp > smtp', () => {
  const review = new Review({ role: 'owner' })
  const release = new Release({ modelId: 'testmodel-123', semver: '1.2.3', createdBy: 'user:user' })
  const access = new AccessRequest({ metadata: { overview: { entities: ['user:user'] } } })

  test('that a Release Review email is not sent when disabled in config', async () => {
    vi.spyOn(config, 'smtp', 'get').mockReturnValue({
      enabled: false,
      connection: {
        host: 'localhost',
        port: 1025,
        secure: false,
        auth: { user: '', pass: '' },
        tls: {
          rejectUnauthorized: false,
        },
      },
      from: '"Bailo 📝" <bailo@example.org>',
    })

    await requestReviewForRelease('user:user', review, release)

    expect(transporterMock.sendMail).not.toBeCalled()
  })

  test('that an Access Request Review email is not sent when disabled in config', async () => {
    vi.spyOn(config, 'smtp', 'get').mockReturnValue({
      enabled: false,
      connection: {
        host: 'localhost',
        port: 1025,
        secure: false,
        auth: { user: '', pass: '' },
        tls: {
          rejectUnauthorized: false,
        },
      },
      from: '"Bailo 📝" <bailo@example.org>',
    })

    await requestReviewForAccessRequest('user:user', review, access)

    expect(transporterMock.sendMail).not.toBeCalled()
  })

  test('that an email is sent for Release Reviews', async () => {
    await requestReviewForRelease('user:user', review, release)

    expect(transporterMock.sendMail.mock.calls.at(0)).toMatchSnapshot()
  })

  test('that an email is sent for Access Request Reviews', async () => {
    await requestReviewForAccessRequest('user:user', review, access)

    expect(transporterMock.sendMail.mock.calls.at(0)).toMatchSnapshot()
  })

  test('that sendEmail is called for each member of a group entity', async () => {
    authorisationMock.getUserInformationList.mockReturnValueOnce([
      Promise.resolve({ email: 'member1@email.com' }),
      Promise.resolve({ email: 'member2@email.com' }),
    ])

    await requestReviewForRelease('group:group1', review, release)

    expect(transporterMock.sendMail.mock.calls).toMatchSnapshot()
  })

  test('that sendEmail is called a maximum of 20 times', async () => {
    const users: Promise<{ email: string }>[] = []
    for (let i = 0; i < 20; i += 1) {
      users[i] = Promise.resolve({ email: `member${i}@email.com` })
    }
    authorisationMock.getUserInformationList.mockReturnValueOnce(users)

    await requestReviewForRelease('group:group1', new Review({ role: 'owner' }), new Release())

    expect(transporterMock.sendMail.mock.calls.length).toBe(20)
  })

  test('that we log when an email cannot be sent', async () => {
    authorisationMock.getUserInformationList.mockReturnValueOnce([
      Promise.resolve({ email: 'member1@email.com' }),
      Promise.resolve({ email: 'member2@email.com' }),
    ])
    transporterMock.sendMail.mockRejectedValueOnce('Failed to send email')

    const result: Promise<void> = requestReviewForRelease('user:user', review, release)
    expect(result).rejects.toThrowError(`Unable to send email`)
  })
})

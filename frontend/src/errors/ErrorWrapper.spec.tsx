import { render, screen, waitFor } from '@testing-library/react'
import ErrorWrapper, { MinimalErrorWrapper } from './ErrorWrapper'
import mockRouter from 'next-router-mock'
import { beforeAll, describe, it, expect } from 'vitest'

describe('ErrorWrapper', () => {
  beforeAll(() => {
    mockRouter.push('/')
  })
  it('renders an ErrorWrapper component', async () => {
    render(<ErrorWrapper message='error!' />)

    await waitFor(async () => {
      expect(await screen.findByText('error!')).not.toBeUndefined()
    })
  })

  it('renders a MinimalErrorWrapper component', async () => {
    render(<MinimalErrorWrapper message='error!' />)

    await waitFor(async () => {
      expect(await screen.findByText('error!')).not.toBeUndefined()
    })
  })
})

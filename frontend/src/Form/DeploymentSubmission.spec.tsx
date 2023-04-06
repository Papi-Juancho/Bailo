import { render, screen, waitFor } from '@testing-library/react'
import DeploymentSubmission from './DeploymentSubmission'
import { doNothing } from '../../utils/testUtils'
import { useGetUiConfig } from '../../data/uiConfig'
import { vi } from 'vitest'

vi.mock('../../data/uiConfig', () => ({
  useGetUiConfig: vi.fn(),
}))

describe('DeploymentSubmission', () => {
  it('renders an DeploymentSubmission component', async () => {
    const mockedConfig: any = {
      uiConfig: {
        deploymentWarning: {
          showWarning: true,
          checkboxText: 'please check before submitting',
        },
      },
      isUiConfigLoading: false,
      isUiConfigError: false,
    }

    vi.mocked(useGetUiConfig).mockReturnValueOnce(mockedConfig)

    render(<DeploymentSubmission onSubmit={doNothing} activeStep={1} setActiveStep={doNothing} />)

    await waitFor(async () => {
      expect(await screen.findByText('Request Deployment')).not.toBeUndefined()
      expect(await screen.findByText('Previous Section')).not.toBeUndefined()
      expect(await screen.findByText('please check before submitting')).not.toBeUndefined()
    })
  })
})

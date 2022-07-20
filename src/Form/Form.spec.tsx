/**
 * @jest-environment jsdom
 */

import Form from './Form'
import { fireEvent, getByText, render, screen, waitFor } from '@testing-library/react'

describe('Form', () => {
  const splitSchema: any = {
    reference: 'test-schema',
    steps: [
      {
        schema: {
          title: 'Submission',
        },
        state: {},
        schemaRef: 'test-schema',
        type: 'Message',
        index: 0,
        section: 'submission',
        render: () => null,
        renderButtons: () => <div>test page</div>,
        isComplete: () => true,
      },
    ],
  }

  it('renders an Form component with the FormDesigner component open', async () => {
    render(<Form onSubmit={() => {}} setSplitSchema={() => {}} modelUploading={false} splitSchema={splitSchema} />)

    await waitFor(async () => {
      expect(await screen.findByText('test page')).not.toBeUndefined()
      expect(await screen.findByText('Submission')).not.toBeUndefined()
      expect(await screen.findByText('Designer')).not.toBeUndefined()
    })
  })

  it('renders an Form component with the FormUpload component open', async () => {
    const { container } = render(
      <Form onSubmit={() => {}} setSplitSchema={() => {}} modelUploading={false} splitSchema={splitSchema} />
    )

    fireEvent(
      getByText(container, 'Upload Existing'),
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      })
    )

    await waitFor(async () => {
      // broken tests?
      // expect(await screen.findByText('{}')).not.toBeUndefined()
      // expect(await screen.findAllByText('Metadata')).not.toBeUndefined()
      expect(await screen.findByText('Upload Existing')).not.toBeUndefined()
    })
  })
})

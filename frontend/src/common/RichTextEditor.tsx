import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { MDEditorProps } from '@uiw/react-md-editor'
import dynamic from 'next/dynamic'
import { ReactNode, useState } from 'react'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

export type RichTextEditorProps = {
  value: string
  onChange: (value: string) => void
  label?: ReactNode
  textareaProps?: MDEditorProps['textareaProps']
}

export default function RichTextEditor({ value, onChange, textareaProps, label = <></> }: RichTextEditorProps) {
  const [hideToolbar, setHideToolbar] = useState(true)

  const toggleToolbar = () => {
    setHideToolbar(!hideToolbar)
  }

  const handleChange = (newValue?: string) => {
    onChange(newValue || '')
  }

  return (
    <>
      <Box display='flex'>
        {label}
        <Button size='small' onClick={toggleToolbar} sx={{ ml: 'auto' }}>
          {`${hideToolbar ? 'Show' : 'Hide'} Toolbar`}
        </Button>
      </Box>
      <MDEditor
        defaultTabEnable
        value={value}
        preview='edit'
        hideToolbar={hideToolbar}
        height={150}
        textareaProps={textareaProps}
        onChange={handleChange}
      />
    </>
  )
}

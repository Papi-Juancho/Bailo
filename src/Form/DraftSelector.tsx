import { useState } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'

import { Draft } from '../../types/interfaces'

export default function DraftSelector({
  currentDraft,
  setCurrentDraft,
  drafts,
}: {
  currentDraft: Draft | undefined
  setCurrentDraft: Function
  drafts: Array<Draft>
}) {
  const [open, setOpen] = useState<boolean>(false)
  const [draft, setDraft] = useState<Draft | undefined>(undefined)

  const handleClose = () => {
    setOpen(false)
  }

  const onCancel = () => {
    setOpen(false)
  }

  const onConfirm = () => {
    if (draft === undefined) {
      // create a new draft...
    }

    setCurrentDraft(draft)
  }

  const onDraftChange = (event: any) => {
    const draft = drafts.find((cur: any) => cur._id === event.target.value)

    setDraft(draft)
    setOpen(true)
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle id='alert-dialog-title'>Load Draft?</DialogTitle>
        <DialogContent>
          <DialogContentText id='alert-dialog-description'>This will reset all existing data in your form.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color='secondary' variant='outlined' onClick={onCancel}>
            Cancel
          </Button>
          <Button variant='contained' onClick={onConfirm} autoFocus data-test='confirmButton'>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <FormControl sx={{ minWidth: 300, pr: 1 }}>
        <InputLabel id='draft-label'>Draft</InputLabel>
        <Select
          labelId='draft-selector-label'
          id='draft-selector'
          value={currentDraft?.name || ''}
          label='Draft'
          onChange={onDraftChange}
        >
          {drafts.map((draft: Draft, index: number) => (
            <MenuItem key={`draft-${index}`} value={draft._id}>
              {draft.name}
            </MenuItem>
          ))}
          <MenuItem value='NewDraft'>New Draft...</MenuItem>
        </Select>
      </FormControl>
    </>
  )
}

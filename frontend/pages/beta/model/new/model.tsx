import { Lock, LockOpen } from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  Divider,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useGetTeams } from 'actions/team'
import { useState } from 'react'

import TeamAndModelSelector from '../../../../src/common/TeamAndModelSelector'
import Wrapper from '../../../../src/Wrapper.beta'
import { NewModelData } from '../../../../types/types'

export default function NewModel() {
  const [teamName, setTeamName] = useState('')
  const [modelName, setModelName] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<NewModelData['visibility']>('public')

  const formValid = teamName && modelName && description

  function onSubmit(event) {
    event.preventDefault()
    const formData: NewModelData = {
      teamName,
      modelName,
      description,
      visibility,
    }
    // TODO - after new model page is implemented, forward this data
    console.log(formData)
  }

  const privateLabel = () => {
    return (
      <Stack direction='row' justifyContent='center' alignItems='center' spacing={1}>
        <Lock />
        <Stack sx={{ my: 1 }}>
          <Typography sx={{ fontWeight: 'bold' }}>Private</Typography>
          <Typography variant='caption'>You choose who can access this model</Typography>
        </Stack>
      </Stack>
    )
  }

  const publicLabel = () => {
    return (
      <Stack direction='row' justifyContent='center' alignItems='center' spacing={1}>
        <LockOpen />
        <Stack sx={{ my: 1 }}>
          <Typography sx={{ fontWeight: 'bold' }}>Public</Typography>
          <Typography variant='caption'>You choose who can access this model</Typography>
        </Stack>
      </Stack>
    )
  }

  return (
    <Wrapper title='Create a new Model' page='upload'>
      <Card sx={{ p: 4, maxWidth: 500, m: 'auto' }}>
        <Typography variant='h4' sx={{ fontWeight: 'bold' }} color='primary'>
          Create a new model
        </Typography>
        <Typography>A model repository contains all files, history and information related to a model.</Typography>
        <Box component='form' sx={{ mt: 4 }} onSubmit={onSubmit}>
          <Stack divider={<Divider orientation='vertical' flexItem />} spacing={2}>
            <>
              <Typography variant='h6'>Overview</Typography>
              <Stack direction='row' spacing={2}>
                <TeamAndModelSelector
                  setTeamValue={setTeamName}
                  teamValue={teamName}
                  setModelValue={setModelName}
                  modelValue={modelName}
                />
              </Stack>
              <Stack>
                <Typography sx={{ fontWeight: 'bold' }}>
                  Description <span style={{ color: 'red' }}>*</span>
                </Typography>
                <TextField required size='small' value={description} onChange={(e) => setDescription(e.target.value)} />
              </Stack>
            </>
            <Divider />
            <>
              <Typography variant='h6'>Access control</Typography>
              <RadioGroup
                defaultValue='public'
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as NewModelData['visibility'])}
              >
                <FormControlLabel value='public' control={<Radio />} label={publicLabel()} />
                <FormControlLabel value='private' control={<Radio />} label={privateLabel()} />
              </RadioGroup>
            </>
            <Divider />
            <Box sx={{ textAlign: 'right' }}>
              <Tooltip title={!formValid ? 'Please make sure all required fields are filled out' : ''}>
                <span>
                  <Button variant='contained' disabled={!formValid} type='submit'>
                    Create Model
                  </Button>
                </span>
              </Tooltip>
            </Box>
          </Stack>
        </Box>
      </Card>
    </Wrapper>
  )
}

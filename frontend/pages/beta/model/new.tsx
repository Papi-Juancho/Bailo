import { Lock, LockOpen } from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  Divider,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { getErrorMessage } from 'utils/fetcher'

import { postModel } from '../../../actions/model'
import RichTextEditor from '../../../src/common/RichTextEditor'
import TeamAndModelSelector from '../../../src/common/TeamAndModelSelector'
import MessageAlert from '../../../src/MessageAlert'
import Wrapper from '../../../src/Wrapper.beta'
import { ModelForm } from '../../../types/v2/types'

export default function NewModel() {
  const [teamName, setTeamName] = useState('')
  const [modelName, setModelName] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<ModelForm['visibility']>('public')
  const [errorMessage, setErrorMessage] = useState('')

  const router = useRouter()
  const theme = useTheme()

  const formValid = teamName && modelName && description

  async function onSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    const formData: ModelForm = {
      name: `${teamName}/${modelName}`,
      description,
      visibility,
    }
    const response = await postModel(formData)

    if (!response.ok) {
      const error = await getErrorMessage(response)
      return setErrorMessage(error)
    }

    const data = await response.json()
    router.push(`/beta/model/${data.model.id}`)
  }

  const privateLabel = () => {
    return (
      <Stack direction='row' justifyContent='center' alignItems='center' spacing={1}>
        <Lock />
        <Stack sx={{ my: 1 }}>
          <Typography sx={{ fontWeight: 'bold' }}>Private</Typography>
          <Typography variant='caption'>Only named individuals will be able to view this model</Typography>
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
          <Typography variant='caption'>Any authorised user will be able to see this model</Typography>
        </Stack>
      </Stack>
    )
  }

  return (
    <Wrapper title='Create a new Model' page='upload'>
      <Card sx={{ p: 4, maxWidth: 520, m: 'auto' }}>
        <Typography
          component='h1'
          variant='h4'
          sx={{ fontWeight: 'bold' }}
          color='primary'
          data-test='createModelPageTitle'
        >
          Create a new model
        </Typography>
        <Typography>A model repository contains all files, history and information related to a model.</Typography>
        <Box component='form' sx={{ mt: 4 }} onSubmit={onSubmit}>
          <Stack divider={<Divider orientation='vertical' flexItem />} spacing={2}>
            <>
              <Typography component='h2' variant='h6'>
                Overview
              </Typography>
              <Box sx={{ width: '100%' }}>
                <TeamAndModelSelector
                  setTeamValue={setTeamName}
                  teamValue={teamName}
                  setModelValue={setModelName}
                  modelValue={modelName}
                />
              </Box>
              <Stack>
                <FormControl>
                  <Box id='new-model-description'>
                    <RichTextEditor
                      dataValue={description}
                      onDataValueChange={(value) => setDescription(value)}
                      data-test='modelDescription'
                      aria-label='Model Description'
                      dataTestKey='modelDescription'
                      label={
                        <Typography component='label' sx={{ fontWeight: 'bold' }} htmlFor={'new-model-description'}>
                          Description <span style={{ color: theme.palette.primary.main }}>*</span>
                        </Typography>
                      }
                    />
                  </Box>
                </FormControl>
              </Stack>
            </>
            <Divider />
            <>
              <Typography component='h3' variant='h6'>
                Access control
              </Typography>
              <RadioGroup
                defaultValue='public'
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as ModelForm['visibility'])}
              >
                <FormControlLabel
                  value='public'
                  control={<Radio />}
                  label={publicLabel()}
                  data-test='publicButtonSelector'
                />
                <FormControlLabel
                  value='private'
                  control={<Radio />}
                  label={privateLabel()}
                  data-test='privateButtonSelector'
                />
              </RadioGroup>
            </>
            <Divider />
            <Box sx={{ textAlign: 'right' }}>
              <Tooltip title={!formValid ? 'Please make sure all required fields are filled out' : ''}>
                <span>
                  <Button variant='contained' disabled={!formValid} type='submit' data-test='createModelButton'>
                    Create Model
                  </Button>
                </span>
              </Tooltip>
              <MessageAlert message={errorMessage} severity='error' />
            </Box>
          </Stack>
        </Box>
      </Card>
    </Wrapper>
  )
}

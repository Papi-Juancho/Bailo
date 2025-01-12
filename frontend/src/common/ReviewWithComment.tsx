import {
  Autocomplete,
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { SyntheticEvent, useEffect, useState } from 'react'

import { useGetModelRoles } from '../../actions/model'
import { useGetReviewRequestsForModel } from '../../actions/review'
import { ReviewRequestInterface } from '../../types/interfaces'
import { ReleaseInterface } from '../../types/types'
import { getRoleDisplay } from '../../utils/beta/roles'
import MessageAlert from '../MessageAlert'
import Loading from './Loading'

type ReviewWithCommentProps = {
  open: boolean
  onClose: () => void
  onSubmit: (kind: ResponseTypeKeys, reviewComment: string, reviewRole: string) => void
  title: string
  description?: string
  release: ReleaseInterface
  errorText: string
}

export const ResponseTypes = {
  Approve: 'approve',
  RequestChanges: 'request_changes',
} as const

export type ResponseTypeKeys = (typeof ResponseTypes)[keyof typeof ResponseTypes]

export default function ReviewWithComment({
  title,
  description,
  open,
  onClose,
  onSubmit,
  release,
  errorText,
}: ReviewWithCommentProps) {
  const { reviews } = useGetReviewRequestsForModel(release.modelId, release.semver, true)
  const { modelRoles, isModelRolesLoading, isModelRolesError } = useGetModelRoles(reviews[0].model.id)
  const theme = useTheme()

  const [reviewComment, setReviewComment] = useState('')
  const [showError, setShowError] = useState(false)
  const [selectOpen, setSelectOpen] = useState(false)
  const [reviewRequest, setReviewRequest] = useState<ReviewRequestInterface | undefined>()

  useEffect(() => {
    if (reviews) {
      setReviewRequest(reviews[0])
    }
  }, [reviews])

  function invalidComment() {
    return reviewComment.trim() === '' ? true : false
  }

  function submitForm(kind: ResponseTypeKeys) {
    setShowError(false)
    if (invalidComment() && kind === ResponseTypes.RequestChanges) {
      setShowError(true)
    } else {
      if (reviewRequest) {
        onSubmit(kind, reviewComment, reviewRequest.role)
      } else {
        return <MessageAlert message='Could not find associated access requests' severity='error' />
      }
    }
  }

  function onChange(_event: SyntheticEvent<Element, Event>, newValue: ReviewRequestInterface | null) {
    if (newValue) {
      setReviewRequest(newValue)
    }
  }

  if (isModelRolesError) {
    return <MessageAlert message={isModelRolesError.info.message} severity='error' />
  }

  return (
    <>
      {isModelRolesLoading && <Loading />}

      <Dialog fullWidth open={open} onClose={onClose}>
        <DialogTitle>{title}</DialogTitle>

        <DialogContent>
          {modelRoles.length === 0 && (
            <Typography color={theme.palette.error.main}>There was a problem fetching model roles.</Typography>
          )}
          {modelRoles.length && (
            <Stack spacing={2}>
              <Autocomplete
                sx={{ pt: 1 }}
                open={selectOpen}
                onOpen={() => {
                  setSelectOpen(true)
                }}
                onClose={() => {
                  setSelectOpen(false)
                }}
                // we might get a string or an object back
                isOptionEqualToValue={(option: ReviewRequestInterface, value: ReviewRequestInterface) =>
                  option.role === value.role
                }
                onChange={onChange}
                value={reviewRequest}
                disabled={reviews.length === 1}
                getOptionLabel={(option) => getRoleDisplay(option.role, modelRoles)}
                options={reviews}
                renderInput={(params) => <TextField {...params} label='Select your role' size='small' />}
              />
              {description && <DialogContentText>{description}</DialogContentText>}
              <TextField
                size='small'
                minRows={4}
                maxRows={8}
                multiline
                placeholder='Leave a comment'
                data-test='review-with-comment-input'
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                error={showError}
                helperText={showError ? 'You must submit a comment when requesting changes.' : ''}
              />
              <Stack
                spacing={2}
                direction={{ sm: 'row', xs: 'column' }}
                justifyContent='space-between'
                alignItems='center'
              >
                <Button onClick={onClose}>Cancel</Button>
                <Stack spacing={2} direction={{ sm: 'row', xs: 'column' }}>
                  <Button variant='outlined' onClick={() => submitForm(ResponseTypes.RequestChanges)}>
                    Request Changes
                  </Button>
                  <Button variant='contained' onClick={() => submitForm(ResponseTypes.Approve)}>
                    Approve
                  </Button>
                </Stack>
              </Stack>
              <Typography color={theme.palette.error.main} variant='caption'>
                {errorText}
              </Typography>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

import { Autocomplete, Divider, Stack, TextField, Typography } from '@mui/material'
import { useGetModels } from 'actions/model'
import { useGetTeams } from 'actions/team'

export type TeamAndModelSelectorProps = {
  setTeamValue: (string) => void
  teamValue: string
  setModelValue: (string) => void
  modelValue: string
}

export default function TeamAndModelSelector({
  setTeamValue,
  setModelValue,
  teamValue,
  modelValue,
}: TeamAndModelSelectorProps) {
  const { teams, isTeamsLoading, isTeamsError } = useGetTeams()
  const { models, isModelLoading, isModelError } = useGetModels()
  const teamNames = teams
    ? teams.map((team) => {
        return { value: team.id, label: team.name }
      })
    : [
        { value: 'teamOne', label: 'team 1' },
        { value: 'teamTwo', label: 'team 2' },
      ]
  const modelNames = models
    ? models.map((model) => {
        return { value: model.id, label: model.name }
      })
    : []

  return (
    <Stack
      spacing={2}
      direction={{ xs: 'column', sm: 'row' }}
      divider={<Divider variant='middle' flexItem orientation='vertical' />}
    >
      <Selector data={teamNames} setData={(value) => setTeamValue(value)} label='Team' value={teamValue} />
      <Selector data={modelNames} setData={(value) => setModelValue(value)} label='Model' value={modelValue} />
    </Stack>
  )
}

interface SelectorProps {
  data: any
  setData: (value: string) => void
  label: string
  value: string
}

function Selector({ data, setData, label, value }: SelectorProps) {
  return (
    <Stack>
      <Typography sx={{ fontWeight: 'bold' }}>
        {label} <span style={{ color: 'red' }}>*</span>
      </Typography>
      <Stack spacing={2} sx={{ width: 200 }}>
        <Autocomplete
          freeSolo
          onChange={(_event, newValue: string | null) => setData(newValue ? newValue : '')}
          options={data.map((option) => option.label)}
          value={value}
          renderInput={(params) => <TextField {...params} required size='small' value={data} />}
        />
      </Stack>
    </Stack>
  )
}

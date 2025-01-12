import { Box, Button, Divider, List, ListItem, ListItemButton, Stack, Typography } from '@mui/material'
import { useState } from 'react'

import { ModelInterface } from '../../../types/v2/types'
import AccessRequestSettings from './settings/AccessRequestSettings'
import ModelAccess from './settings/ModelAccess'

type SettingsCategory = 'general' | 'danger' | 'access'

type SettingsProps = {
  model: ModelInterface
}

export default function Settings({ model }: SettingsProps) {
  const [selectedCategory, setSelectedCategory] = useState<SettingsCategory>('general')

  const handleListItemClick = (category: SettingsCategory) => {
    setSelectedCategory(category)
  }
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={{ sm: 2 }}
      divider={<Divider orientation='vertical' flexItem />}
    >
      <List>
        <ListItem disablePadding>
          <ListItemButton selected={selectedCategory === 'general'} onClick={() => handleListItemClick('general')}>
            General Settings
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton selected={selectedCategory === 'access'} onClick={() => handleListItemClick('access')}>
            Access Requests
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton selected={selectedCategory === 'danger'} onClick={() => handleListItemClick('danger')}>
            Danger Zone
          </ListItemButton>
        </ListItem>
      </List>
      <Box sx={{ width: '100%', maxWidth: '1000px' }}>
        {selectedCategory === 'general' && <ModelAccess model={model} />}
        {selectedCategory === 'access' && <AccessRequestSettings />}
        {selectedCategory === 'danger' && (
          <Stack spacing={2}>
            <Typography variant='h6' component='h2'>
              Danger Zone!
            </Typography>
            <Button variant='contained' disabled>
              Delete model
            </Button>
          </Stack>
        )}
      </Box>
    </Stack>
  )
}

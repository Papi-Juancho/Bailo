import ClearIcon from '@mui/icons-material/Clear'
import GroupsIcon from '@mui/icons-material/Groups'
import PersonIcon from '@mui/icons-material/Person'
import { Autocomplete, Chip, IconButton, TableCell, TableRow, TextField, Tooltip, Typography } from '@mui/material'
import _ from 'lodash-es'
import { useMemo } from 'react'

import { useGetModelRoles } from '../../../../actions/model'
import { CollaboratorEntry, ModelInterface } from '../../../../types/v2/types'
import Loading from '../../../common/Loading'
import MessageAlert from '../../../MessageAlert'

type EntityItemProps = {
  entity: CollaboratorEntry
  accessList: CollaboratorEntry[]
  onAccessListChange: (value: CollaboratorEntry[]) => void
  model: ModelInterface
}

export default function EntityItem({ entity, accessList, onAccessListChange, model }: EntityItemProps) {
  const { modelRoles, isModelRolesLoading, isModelRolesError } = useGetModelRoles(model.id)

  function onRoleChange(_event: React.SyntheticEvent<Element, Event>, newValues: string[]) {
    const updatedAccessList = _.cloneDeep(accessList)
    const index = updatedAccessList.findIndex((access) => access.entity === entity.entity)
    updatedAccessList[index].roles = newValues
    onAccessListChange(updatedAccessList)
  }

  function removeEntity() {
    onAccessListChange(accessList.filter((access) => access.entity !== entity.entity))
  }

  function getModelRoles() {
    return modelRoles.map((role) => role.id)
  }

  function getRole(roleId: string) {
    const role = modelRoles.find((role) => role.id === roleId)
    if (!role) return { id: roleId, name: 'Unknown Role' }

    return role
  }

  if (isModelRolesError) {
    return <MessageAlert message={isModelRolesError.info.message} severity='error' />
  }

  return (
    <TableRow>
      <TableCell>
        <EntityIcon entity={entity} />
        <EntityNameDisplay entity={entity} />
      </TableCell>
      <TableCell>
        {isModelRolesLoading && <Loading />}
        {!isModelRolesLoading && modelRoles.length > 0 && (
          <Autocomplete
            id='role-selector'
            sx={{ width: '100%' }}
            size='small'
            multiple
            aria-label={`role selector input for entity ${entity.entity}`}
            value={entity.roles}
            data-test='accessListAutoselect'
            options={getModelRoles() || []}
            getOptionLabel={(role) => getRole(role).name}
            onChange={onRoleChange}
            renderInput={(params) => <TextField {...params} label='Select roles' />}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip label={getRole(option).name} {...getTagProps({ index })} key={option} />
              ))
            }
          />
        )}
      </TableCell>
      <TableCell>
        <Tooltip title='Remove user' arrow>
          <IconButton
            onClick={removeEntity}
            aria-label={`Remove user ${entity.entity} from model access list`}
            data-test='accesslistRemoveUser'
          >
            <ClearIcon color='secondary' fontSize='inherit' />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  )
}

type EntityIconProps = {
  entity: CollaboratorEntry
}

function EntityIcon({ entity }: EntityIconProps) {
  const isUser = useMemo(() => entity.entity.startsWith('user:'), [entity])
  return isUser ? <PersonIcon color='primary' /> : <GroupsIcon color='secondary' />
}

type EntityNameDisplayProps = {
  entity: CollaboratorEntry
}

function EntityNameDisplay({ entity }: EntityNameDisplayProps) {
  const entityName = useMemo(() => entity.entity.replace('user:', '').replace('group:', ''), [entity])
  return <Typography>{entityName}</Typography>
}

import CohortIcon from '@mui/icons-material/Grain'
import DeleteIcon from '@mui/icons-material/Delete'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import {
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Popover,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import React, { useState } from 'react'
import { makeStyles } from '../../../utils'
import { PatientId } from '../../patients'
import { FocusEntity } from '../../dataSlice'
import { EntityId } from '../../entities'

const useStyles = makeStyles()((theme) => ({
  button: {
    color: theme.entityColors.cohort,
    borderColor: theme.entityColors.cohort,
    '&:hover': {
      borderColor: theme.entityColors.cohort,
    },
  },
  badge: {
    backgroundColor: theme.entityColors.cohort,
    color: theme.palette.background.paper,
  },
  listContainer: {
    width: '20vw',
    maxHeight: '30vh',
  },
  listToolbar: {
    backgroundColor: theme.palette.background.default,
    marginBottom: theme.spacing(2),
  },
}))

interface Props {
  readonly cohort: ReadonlySet<PatientId>
  readonly hoveredEntity: FocusEntity
  readonly selectedEntityId: EntityId
  readonly onPatientHover: (id: PatientId) => void
  readonly onPatientClick: (id: PatientId) => void
  readonly onRemoveFromCohort: (id: PatientId) => void
  readonly onClearCohort: () => void
  readonly onCopyToClipboard: () => void
}

export const CohortToolbarItem = ({
  cohort,
  hoveredEntity,
  selectedEntityId,
  onRemoveFromCohort,
  onCopyToClipboard,
  onClearCohort,
  onPatientHover,
  onPatientClick,
}: Props) => {
  const theme = useTheme()
  const { classes } = useStyles()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const openPopover = Boolean(anchorEl)
  const id = openPopover ? 'simple-popover' : undefined

  return (
    <Button
      className={classes.button}
      variant={'outlined'}
      onClick={(event) => {
        setAnchorEl(anchorEl ? null : event.currentTarget)
      }}
      endIcon={
        <Badge classes={{ badge: classes.badge }} badgeContent={cohort.size}>
          <CohortIcon />
        </Badge>
      }
    >
      {'Cohort'}
      <Popover
        id={id}
        open={openPopover}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        onClose={() => setAnchorEl(null)}
      >
        <Box className={classes.listContainer}>
          <List>
            {cohort.size === 0 ? (
              <ListItem>
                <ListItemText
                  disableTypography
                  primary={
                    <Typography color={theme.palette.text.disabled}>
                      <i>Empty Cohort</i>
                    </Typography>
                  }
                />
              </ListItem>
            ) : (
              <div>
                <ListSubheader className={classes.listToolbar}>
                  <Stack direction={'row-reverse'} sx={{ mr: -1 }}>
                    <Button endIcon={<DeleteIcon />} color={'primary'} onClick={onClearCohort}>
                      {'Clear All'}
                    </Button>
                    <Button endIcon={<ContentCopyIcon />} color={'primary'} onClick={onCopyToClipboard}>
                      {'Copy'}
                    </Button>
                  </Stack>
                  <Divider />
                </ListSubheader>
                {[...cohort].map((patientId) => (
                  <div key={patientId}>
                    <ListItem
                      disablePadding
                      onClick={(e) => {
                        onPatientClick(patientId)
                        e.stopPropagation()
                      }}
                      onMouseEnter={(e) => {
                        onPatientHover(patientId)
                        e.stopPropagation()
                      }}
                      secondaryAction={
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={(e) => {
                            onRemoveFromCohort(patientId)
                            e.stopPropagation()
                          }}
                        >
                          <DeleteIcon fontSize={'small'} />
                        </IconButton>
                      }
                      sx={{
                        color: patientId === selectedEntityId ? theme.entityColors.selected : undefined,
                        backgroundColor: patientId === hoveredEntity.uid ? theme.entityColors.default : undefined,
                      }}
                    >
                      <ListItemButton>
                        <ListItemText primary={patientId} />
                      </ListItemButton>
                    </ListItem>
                  </div>
                ))}
              </div>
            )}
          </List>
        </Box>
      </Popover>
    </Button>
  )
}

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
  },
}))

interface Props {
  readonly cohort: ReadonlySet<PatientId>
  readonly onRemoveFromCohort: (id: PatientId) => void
  readonly onClearCohort: () => void
  readonly onCopyToClipboard: () => void
}

export const CohortToolbarItem = ({ cohort, onRemoveFromCohort, onCopyToClipboard, onClearCohort }: Props) => {
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
                      secondaryAction={
                        <IconButton edge="end" aria-label="delete" onClick={() => onRemoveFromCohort(patientId)}>
                          <DeleteIcon fontSize={'small'} />
                        </IconButton>
                      }
                    >
                      <ListItemText primary={patientId} />
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

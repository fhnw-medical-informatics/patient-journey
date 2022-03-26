import {
  Avatar,
  Badge,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Popover,
} from '@mui/material'
import { Alert } from '../alertSlice'
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded'
import { useState } from 'react'
import { makeStyles } from '../../utils'

const UNREAD_MARKER_SIZE = 10

const useStyles = makeStyles()((theme) => ({
  button: {
    color: 'white',
  },
  listContainer: {
    width: '30vw',
    maxHeight: '30vh',
  },
  listGutter: {
    minWidth: UNREAD_MARKER_SIZE,
    marginRight: theme.spacing(2),
  },
  unreadMarker: {
    width: UNREAD_MARKER_SIZE,
    height: UNREAD_MARKER_SIZE,
    backgroundColor: theme.palette.error.main,
  },
}))

interface Props {
  readonly alerts: ReadonlyArray<Alert>
  readonly unreadCount: number
  readonly onMarkAlertsRead: () => void
}

export const Alerts = ({ alerts, unreadCount, onMarkAlertsRead }: Props) => {
  const { classes } = useStyles()

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
    onMarkAlertsRead()
  }

  const openPopover = Boolean(anchorEl)
  const id = openPopover ? 'simple-popover' : undefined

  return (
    <>
      <IconButton className={classes.button} onClick={handleClick}>
        <Badge color="error" badgeContent={unreadCount}>
          <NotificationsNoneRoundedIcon />
        </Badge>
      </IconButton>
      <Popover
        id={id}
        open={openPopover}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        onClose={handleClose}
      >
        <Box className={classes.listContainer}>
          <List>
            {alerts.length === 0 && (
              <ListItem>
                <ListItemText primary={'No alerts – Yay! ✨'} />
              </ListItem>
            )}
            {[...alerts].reverse().map((alert, index) => (
              <div key={index}>
                <ListItem>
                  <ListItemAvatar className={classes.listGutter}>
                    {index < unreadCount && <Avatar className={classes.unreadMarker}>{''}</Avatar>}
                  </ListItemAvatar>
                  <ListItemText primary={alert.topic} secondary={alert.message} />
                </ListItem>
                {index < alerts.length - 1 && <Divider component="li" />}
              </div>
            ))}
          </List>
        </Box>
      </Popover>
    </>
  )
}

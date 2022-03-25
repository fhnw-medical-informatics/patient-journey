import { Badge, IconButton, Popover, Typography } from '@mui/material'
import { AlertState } from '../alertSlice'
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded'
import { useState } from 'react'

interface Props {
  readonly alertState: AlertState
  readonly onMarkAlertsRead: () => void
}

export const AlertsButton = ({ alertState, onMarkAlertsRead }: Props) => {
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
      <IconButton onClick={handleClick}>
        <Badge color="error" badgeContent={alertState.unreadCount}>
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
        <Typography sx={{ p: 2 }}>{'TODO'}</Typography>
      </Popover>
    </>
  )
}

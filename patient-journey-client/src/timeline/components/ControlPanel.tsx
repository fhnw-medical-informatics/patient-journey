import { FormControl, Typography } from '@material-ui/core'
import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { InputLabel, MenuItem, Select, SelectChangeEvent, Tooltip } from '@mui/material'
import HelpIcon from '@mui/icons-material/Help'
import { Box } from '@mui/system'
import { TimelineType } from '../timelineSlice'
import { useAppSelector } from '../../store'

const useStyles = makeStyles({
  controlPanel: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '50% 50%',
    alignItems: 'center',
  },
  paper: {
    padding: 15,
    marginRight: 5,
  },
  hci: {
    color: '#9e9e9e',
    lineHeight: 0.8,
    '& td': {
      paddingRight: 10,
    },
  },
})

interface ControlPanelProps {
  onSetTimelineType: (type: TimelineType) => void
}

export const ControlPanel = ({ onSetTimelineType }: ControlPanelProps) => {
  const classes = useStyles()

  return (
    <div className={classes.controlPanel}>
      <Box className={classes.paper}>
        <ConfigOptions onSetTimelineType={onSetTimelineType} />
      </Box>
      <Box className={classes.paper} alignItems="right">
        <Tooltip title={<KeyboardShortcuts />} placement="top">
          <HelpIcon />
        </Tooltip>
      </Box>
    </div>
  )
}

const KeyboardShortcuts = () => {
  const classes = useStyles()
  return (
    <Typography className={classes.hci} component={'div'}>
      <table>
        <tbody>
          <tr>
            <td>Zoom In:</td>
            <td>Click</td>
          </tr>
          <tr>
            <td>Zoom Out:</td>
            <td>Alt + Click</td>
          </tr>
          <tr>
            <td>Zoom Custom:</td>
            <td>Shift + Click + Drag</td>
          </tr>
          <tr>
            <td>Pan:</td>
            <td>Click + Drag</td>
          </tr>
          <tr>
            <td>Reset:</td>
            <td>Esc</td>
          </tr>
        </tbody>
      </table>
    </Typography>
  )
}

const ConfigOptions = ({ onSetTimelineType }: ControlPanelProps) => {
  const timelineState = useAppSelector((state) => state.timeline)

  const onChangeView = (event: SelectChangeEvent) => {
    console.log(event)
    if (event.target.value === 'timestamp') {
      onSetTimelineType('timestamp')
    }
    if (event.target.value === 'date of birth') {
      onSetTimelineType('date of birth')
      console.log(event.target.value)
      console.log(timelineState)
    }
  }

  return (
    <FormControl>
      <InputLabel id="demo-simple-select-label">Column</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={timelineState.type}
        label="View"
        onChange={onChangeView}
        size="small"
      >
        <MenuItem value={'date of birth'}>Date Of Birth</MenuItem>
        <MenuItem value={'timestamp'}>Timestamp</MenuItem>
      </Select>
    </FormControl>
  )
}

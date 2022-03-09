import { FormControl, Typography } from '@material-ui/core'
import React from 'react'
import { makeStyles } from '../../utils'
import { FormControlLabel, Grid, MenuItem, Select, SelectChangeEvent, Switch, Tooltip } from '@mui/material'
import HelpIcon from '@mui/icons-material/Help'
import { Box } from '@mui/system'
import { TimelineType } from '../timelineSlice'
import { useAppSelector } from '../../store'

const useStyles = makeStyles()((theme) => ({
  root: {
    width: '100%',
    display: 'grid',
    gridTemplateColumns: '50% 50%',
    alignItems: 'center',
  },
  toolbar: {
    flex: 1,
  },
  timelineContainer: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(0.5),
  },
  timeline: {
    display: 'grid',
    height: '100%',
    width: '100%',
  },
  paper: {
    padding: 15,
    marginRight: 5,
  },
}))

interface ControlPanelProps {
  onSetTimelineType: (type: TimelineType) => void
  onSetTimelineCluster: () => void
}

export const ControlPanel = ({ onSetTimelineType, onSetTimelineCluster }: ControlPanelProps) => {
  const { classes } = useStyles()

  const timelineState = useAppSelector((state) => state.timeline)

  const onChangeType = (event: SelectChangeEvent) => {
    if (event.target.value === 'timestamp') {
      onSetTimelineType('timestamp')
    }
    if (event.target.value === 'date of birth') {
      onSetTimelineType('date of birth')
    }
  }

  return (
    <div className={classes.root}>
      <Grid container alignItems="center">
        <Grid item>
          <Box className={classes.paper}>
            <FormControl>
              <Select
                id="demo-simple-select"
                value={timelineState.type}
                label="Age"
                onChange={onChangeType}
                size="small"
              >
                <MenuItem value={'date of birth'}>Date Of Birth</MenuItem>
                <MenuItem value={'timestamp'}>Timestamp</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>
        <Grid item>
          <FormControlLabel
            control={<Switch checked={timelineState.cluster} onChange={() => onSetTimelineCluster()} color="primary" />}
            label="Cluster Patients"
          />
        </Grid>
        <Grid item>
          <Box className={classes.paper} alignItems="right">
            <Tooltip
              title={
                <div>
                  <Typography color="inherit">Timline keyboard shortcuts</Typography>
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
                </div>
              }
              placement="top"
              arrow
            >
              <HelpIcon />
            </Tooltip>
          </Box>
        </Grid>
      </Grid>
    </div>
  )
}

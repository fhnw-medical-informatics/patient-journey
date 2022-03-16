import { FormControl, Typography } from '@material-ui/core'
import React from 'react'
import { makeStyles } from '../../utils'
import { FormControlLabel, Grid, MenuItem, Select, SelectChangeEvent, Switch, Tooltip } from '@mui/material'
import HelpIcon from '@mui/icons-material/Help'
import { Box } from '@mui/system'
import { TimelineColumn, TimelineState } from '../timelineSlice'

const useStyles = makeStyles()((theme) => ({
  root: {
    width: '100%',
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
  onSetTimelineColumn: (column: TimelineColumn) => void
  onSetTimelineCluster: () => void
  onSetTimelineGrouping: () => void
  timelineState: TimelineState
  availableColumns: ReadonlyArray<TimelineColumn>
  numberOfEvents: Number
}

export const ControlPanel = ({
  onSetTimelineColumn,
  onSetTimelineCluster,
  onSetTimelineGrouping,
  timelineState,
  availableColumns,
  numberOfEvents,
}: ControlPanelProps) => {
  const { classes } = useStyles()

  const onChangeColumn = (event: SelectChangeEvent) => {
    onSetTimelineColumn(availableColumns[Number(event.target.value)])
  }

  let activeColumn: TimelineColumn | undefined = availableColumns.find((column) =>
    column.type === 'timestamp' || column.type === 'date' ? column : undefined
  )

  if (typeof activeColumn !== 'undefined' && timelineState.column === undefined) {
    onSetTimelineColumn(activeColumn)
  }

  if (timelineState.grouping === false && numberOfEvents > 10) {
    onSetTimelineGrouping()
  }

  return (
    <div className={classes.root}>
      <Grid container alignItems="center">
        <Grid item>
          <Box className={classes.paper}>
            <FormControl>
              <Select
                id="demo-simple-select"
                value={timelineState.column ? String(timelineState.column.index) : ''}
                label="Age"
                onChange={onChangeColumn}
                size="small"
              >
                {availableColumns.map((column) => {
                  if (column.type === 'timestamp' || column.type === 'date') {
                    return (
                      <MenuItem key={column.index} value={column.index}>
                        {column.name}
                      </MenuItem>
                    )
                  }
                  return null
                })}
              </Select>
            </FormControl>
          </Box>
        </Grid>
        <Grid item>
          <FormControlLabel
            control={
              <Switch checked={timelineState.grouping} onChange={() => onSetTimelineGrouping()} color="primary" />
            }
            label="Group"
            disabled={numberOfEvents > 10}
          />
        </Grid>
        <Grid item>
          <FormControlLabel
            control={<Switch checked={timelineState.cluster} onChange={() => onSetTimelineCluster()} color="primary" />}
            label="Cluster"
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

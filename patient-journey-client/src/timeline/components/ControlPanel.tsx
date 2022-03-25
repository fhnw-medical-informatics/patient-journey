import React, { useEffect } from 'react'
import { FormControl, Typography } from '@material-ui/core'

import { makeStyles } from '../../utils'

import { FormControlLabel, Grid, MenuItem, Select, SelectChangeEvent, Switch, Tooltip } from '@mui/material'
import HelpIcon from '@mui/icons-material/Help'
import { TimelineColumn, TimelineColumnNone, TimelineState } from '../timelineSlice'
import { PatientDataColumn } from '../../data/patients'
import { EventDataColumn } from '../../data/events'
import { ColorByColumnNone, ColorByColumnOption } from '../../color'

const useStyles = makeStyles()((theme) => ({
  root: {
    width: '100%',
  },
  toolbar: {
    padding: theme.spacing(2),
  },
}))

interface ControlPanelProps {
  onSetTimelineColumn: (column: TimelineColumn) => void
  onSetTimelineCluster: () => void
  onSetTimelineGrouping: () => void
  timelineState: TimelineState
  availableColumns: ReadonlyArray<EventDataColumn | PatientDataColumn>
  numberOfEvents: Number
  colorByColumn: ColorByColumnOption
  onChangeColorByColumn: (column: ColorByColumnOption) => void
}

export const ControlPanel = ({
  onSetTimelineColumn,
  onSetTimelineCluster,
  onSetTimelineGrouping,
  timelineState,
  availableColumns,
  numberOfEvents,
  colorByColumn,
  onChangeColorByColumn,
}: ControlPanelProps) => {
  const { classes } = useStyles()

  useEffect(() => {
    const setInitialActiveColumn = () => {
      const firstTimeColumn = availableColumns.find((column) => column.type === 'timestamp' || column.type === 'date')

      onSetTimelineColumn(firstTimeColumn ?? TimelineColumnNone)
    }

    if (timelineState.column === TimelineColumnNone) {
      // Set initial column if no column is selected
      setInitialActiveColumn()
    } else {
      // Set initial column if selected column is not available anymore
      const currentColumn = timelineState.column
      const doesContain =
        availableColumns.findIndex(
          (column) => column.name === currentColumn.name && column.index === currentColumn.index
        ) !== -1

      if (!doesContain) {
        setInitialActiveColumn()
      }
    }
  }, [timelineState.column, onSetTimelineColumn, availableColumns])

  // Reset colorByColumn when availableColumns change
  useEffect(() => {
    onChangeColorByColumn('off')
  }, [onChangeColorByColumn, availableColumns])

  const onChangeColumn = (event: SelectChangeEvent) => {
    onSetTimelineColumn(availableColumns.find((column) => column.name === event.target.value) ?? TimelineColumnNone)
  }

  const handleChangeColorByColumn = (event: SelectChangeEvent) => {
    onChangeColorByColumn(availableColumns.find((column) => column.name === event.target.value) ?? ColorByColumnNone)
  }

  return (
    <div className={classes.root}>
      <Grid container alignItems={'flex-start'} justifyContent={'space-between'} className={classes.toolbar}>
        <Grid item xs="auto">
          <Grid container alignItems={'flex-end'} spacing={4}>
            <Grid item>
              <Typography variant="overline" display="block">
                View by
              </Typography>
              <FormControl>
                <Select
                  value={timelineState.column !== TimelineColumnNone ? timelineState.column.name : ''}
                  onChange={onChangeColumn}
                  size="small"
                >
                  {availableColumns
                    .filter((column) => column.type === 'timestamp' || column.type === 'date')
                    .map((column) => (
                      <MenuItem key={column.name} value={column.name}>
                        {column.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item>
              <Typography variant="overline" display="block">
                Color by
              </Typography>
              <FormControl>
                <Select
                  value={colorByColumn !== ColorByColumnNone ? colorByColumn.name : ColorByColumnNone}
                  onChange={handleChangeColorByColumn}
                  size="small"
                >
                  <MenuItem value={ColorByColumnNone}>
                    <i>{'Off'}</i>
                  </MenuItem>
                  {availableColumns
                    .filter((column) => ['timestamp', 'date', 'number', 'boolean', 'string'].includes(column.type))
                    .map((column) => (
                      <MenuItem key={column.name} value={column.name}>
                        {column.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item>
              <FormControlLabel
                control={<Switch checked={timelineState.grouping} onChange={onSetTimelineGrouping} color="primary" />}
                label="Collapse Patients"
              />
            </Grid>
            <Grid item>
              <FormControlLabel
                control={<Switch checked={timelineState.cluster} onChange={onSetTimelineCluster} color="primary" />}
                label="Cluster Events"
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs="auto">
          <Grid container alignItems={'flex-start'} spacing={2}>
            <Grid item>
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
                placement="left"
                arrow
              >
                <HelpIcon />
              </Tooltip>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  )
}

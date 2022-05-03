import React, { useEffect } from 'react'
import {
  FormControl,
  FormControlLabel,
  Grid,
  ListSubheader,
  MenuItem,
  Select,
  SelectChangeEvent,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material'
import { makeStyles } from '../../utils'
import HelpIcon from '@mui/icons-material/Help'
import { TimelineColumn, TimelineColumnNone } from '../timelineSlice'
import { PatientDataColumn } from '../../data/patients'
import { EventDataColumn } from '../../data/events'
import { ColorByColumnNone, ColorByColumnOption } from '../../color/colorSlice'

const useStyles = makeStyles()((theme) => ({
  root: {
    width: '100%',
  },
  toolbar: {
    padding: theme.spacing(2),
  },
}))

interface ControlPanelProps {
  viewByColumn: TimelineColumn
  onSetViewByColumn: (column: TimelineColumn) => void
  expandByColumn: TimelineColumn
  onSetExpandByColumn: (column: TimelineColumn) => void
  cluster: boolean
  onSetTimelineCluster: () => void
  showFilteredOut: boolean
  onSetShowFilteredOut: () => void
  showTimeGrid: boolean
  onToggleTimeGrid: () => void
  availableColumns: ReadonlyArray<EventDataColumn | PatientDataColumn>
  eventDataColumns: ReadonlyArray<EventDataColumn>
  patientDataColumns: ReadonlyArray<PatientDataColumn>
  colorByColumn: ColorByColumnOption
  onChangeColorByColumn: (column: ColorByColumnOption) => void
}

export const ControlPanel = ({
  viewByColumn,
  onSetViewByColumn,
  expandByColumn,
  onSetExpandByColumn,
  cluster,
  showTimeGrid,
  onToggleTimeGrid,
  onSetTimelineCluster,
  showFilteredOut,
  onSetShowFilteredOut,
  availableColumns,
  eventDataColumns,
  patientDataColumns,
  colorByColumn,
  onChangeColorByColumn,
}: ControlPanelProps) => {
  const { classes } = useStyles()

  useEffect(() => {
    const setInitialActiveColumn = () => {
      const firstTimeColumn = availableColumns.find((column) => column.type === 'timestamp' || column.type === 'date')

      onSetViewByColumn(firstTimeColumn ?? TimelineColumnNone)
    }

    if (viewByColumn === TimelineColumnNone) {
      // Set initial column if no column is selected
      setInitialActiveColumn()
    } else {
      // Set initial column if selected column is not available anymore
      const currentColumn = viewByColumn
      const doesContain =
        availableColumns.findIndex(
          (column) => column.name === currentColumn.name && column.index === currentColumn.index
        ) !== -1

      if (!doesContain) {
        setInitialActiveColumn()
      }
    }
  }, [viewByColumn, onSetViewByColumn, availableColumns])

  // Reset expandByColumn when availableColumns change
  useEffect(() => {
    onSetExpandByColumn(TimelineColumnNone)
  }, [onSetExpandByColumn, availableColumns])

  // Reset colorByColumn when availableColumns change
  useEffect(() => {
    onChangeColorByColumn('off')
  }, [onChangeColorByColumn, availableColumns])

  const handleChangeViewByColumn = (event: SelectChangeEvent) => {
    onSetViewByColumn(availableColumns.find((column) => column.name === event.target.value) ?? TimelineColumnNone)
  }

  const handleChangeExpandByColumn = (event: SelectChangeEvent) => {
    onSetExpandByColumn(availableColumns.find((column) => column.name === event.target.value) ?? TimelineColumnNone)
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
                  value={viewByColumn !== TimelineColumnNone ? viewByColumn.name : ''}
                  onChange={handleChangeViewByColumn}
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
                Expand by
              </Typography>
              <FormControl>
                <Select
                  value={expandByColumn !== TimelineColumnNone ? expandByColumn.name : TimelineColumnNone}
                  onChange={handleChangeExpandByColumn}
                  size="small"
                >
                  <MenuItem value={TimelineColumnNone}>
                    <i>{'Collapsed'}</i>
                  </MenuItem>
                  {availableColumns
                    .filter((column) => ['pid', 'boolean', 'string', 'category'].includes(column.type))
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
                  <ListSubheader>Patient Columns</ListSubheader>
                  {patientDataColumns
                    .filter((column) =>
                      ['timestamp', 'date', 'number', 'boolean', 'string', 'category'].includes(column.type)
                    )
                    .map((column) => (
                      <MenuItem key={column.name} value={column.name}>
                        {column.name}
                      </MenuItem>
                    ))}
                  <ListSubheader>Event Columns</ListSubheader>
                  {eventDataColumns
                    .filter((column) =>
                      ['timestamp', 'date', 'number', 'boolean', 'string', 'category'].includes(column.type)
                    )
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
                control={<Switch checked={cluster} onChange={onSetTimelineCluster} color="primary" />}
                label="Cluster Events"
              />
            </Grid>
            <Grid item ml={-2}>
              <FormControlLabel
                control={<Switch checked={showFilteredOut} onChange={onSetShowFilteredOut} color="primary" />}
                label="Show Filtered Out Events"
              />
            </Grid>
            <Grid item ml={-2}>
              <FormControlLabel
                control={<Switch checked={showTimeGrid} onChange={onToggleTimeGrid} color="primary" />}
                label="Time Grid"
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
                    <Typography color="inherit">Timeline keyboard shortcuts</Typography>
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

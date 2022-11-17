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
import HelpIcon from '@mui/icons-material/HelpOutline'
import { TimelineColumn, TimelineColumnNone } from '../timelineSlice'
import { PatientDataColumn } from '../../data/patients'
import { EventDataColumn } from '../../data/events'
import { ColorByColumn, ColorByColumnNone, ColorByColumnOptionNone } from '../../color/colorSlice'
import { doesContainColumn } from '../../data/columns'

const useStyles = makeStyles()((theme) => ({
  root: {
    width: '100%',
  },
  toolbar: {
    padding: theme.spacing(2),
    lineHeight: 1,
  },
  checkboxes: {
    margin: 0,
    minWidth: 215,
  },
  help: {
    margin: 0,
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
  allowInteraction: boolean
  onToggleAllowInteraction: () => void
  availableColumns: ReadonlyArray<EventDataColumn | PatientDataColumn>
  eventDataColumns: ReadonlyArray<EventDataColumn>
  patientDataColumns: ReadonlyArray<PatientDataColumn>
  colorByColumn: ColorByColumn
  onChangeColorByColumn: (colorByColumn: ColorByColumn) => void
  hasActiveFilters: boolean
}

export const ControlPanel = ({
  viewByColumn,
  onSetViewByColumn,
  expandByColumn,
  onSetExpandByColumn,
  cluster,
  showTimeGrid,
  onToggleTimeGrid,
  allowInteraction,
  onToggleAllowInteraction,
  onSetTimelineCluster,
  showFilteredOut,
  onSetShowFilteredOut,
  availableColumns,
  eventDataColumns,
  patientDataColumns,
  colorByColumn,
  onChangeColorByColumn,
  hasActiveFilters,
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
      if (!doesContainColumn(availableColumns, viewByColumn)) {
        setInitialActiveColumn()
      }
    }
  }, [viewByColumn, onSetViewByColumn, availableColumns])

  // Reset expandByColumn when availableColumns change
  useEffect(() => {
    if (expandByColumn !== TimelineColumnNone && !doesContainColumn(availableColumns, expandByColumn)) {
      onSetExpandByColumn(TimelineColumnNone)
    }
  }, [onSetExpandByColumn, expandByColumn, availableColumns])

  // Reset colorByColumn when event or patient data columns change
  // TODO: Move this logic to extraReducer within colorSlice and
  // react on dispatched actions that affect columns
  useEffect(() => {
    if (
      colorByColumn.column !== ColorByColumnOptionNone &&
      !doesContainColumn([...eventDataColumns, ...patientDataColumns], colorByColumn.column)
    ) {
      onChangeColorByColumn(ColorByColumnNone)
    }
  }, [onChangeColorByColumn, eventDataColumns, patientDataColumns, colorByColumn])

  const handleChangeViewByColumn = (event: SelectChangeEvent) => {
    onSetViewByColumn(availableColumns.find((column) => column.name === event.target.value) ?? TimelineColumnNone)
  }

  const handleChangeExpandByColumn = (event: SelectChangeEvent) => {
    onSetExpandByColumn(availableColumns.find((column) => column.name === event.target.value) ?? TimelineColumnNone)
  }

  const handleChangeColorByColumn = (event: SelectChangeEvent) => {
    if (event.target.value.startsWith('patients_')) {
      const column = patientDataColumns.find((column) => column.name === event.target.value.replace('patients_', ''))
      onChangeColorByColumn(column ? { type: 'patients', column } : ColorByColumnNone)
    } else if (event.target.value.startsWith('events_')) {
      const column = eventDataColumns.find((column) => column.name === event.target.value.replace('events_', ''))
      onChangeColorByColumn(column ? { type: 'events', column } : ColorByColumnNone)
    } else {
      onChangeColorByColumn(ColorByColumnNone)
    }
  }

  return (
    <div className={classes.root}>
      <Grid
        container
        alignItems={'flex-start'}
        justifyContent={'space-between'}
        className={classes.toolbar}
        spacing={2}
      >
        <Grid item>
          <Grid container alignItems={'flex-end'} spacing={1}>
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
                  value={
                    colorByColumn.type !== 'none' && colorByColumn.column !== ColorByColumnOptionNone
                      ? `${colorByColumn.type}_${colorByColumn.column.name}`
                      : `${ColorByColumnNone.type}_${ColorByColumnNone.column}`
                  }
                  onChange={handleChangeColorByColumn}
                  size="small"
                >
                  <MenuItem value={`${ColorByColumnNone.type}_${ColorByColumnNone.column}`}>
                    <i>{'Off'}</i>
                  </MenuItem>
                  <ListSubheader>Patient Columns</ListSubheader>
                  {patientDataColumns
                    .filter((column) =>
                      ['timestamp', 'date', 'number', 'boolean', 'string', 'category'].includes(column.type)
                    )
                    .map((column) => (
                      <MenuItem key={column.name} value={'patients_' + column.name}>
                        {column.name}
                      </MenuItem>
                    ))}
                  <ListSubheader>Event Columns</ListSubheader>
                  {eventDataColumns
                    .filter((column) =>
                      ['timestamp', 'date', 'number', 'boolean', 'string', 'category'].includes(column.type)
                    )
                    .map((column) => (
                      <MenuItem key={column.name} value={'events_' + column.name}>
                        {column.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs>
          <Grid container spacing={1} className={classes.checkboxes} justifyContent="flex-end">
            <Grid item>
              <FormControlLabel
                control={<Switch checked={cluster} onChange={onSetTimelineCluster} color="primary" size="small" />}
                label="Cluster Events"
              />
            </Grid>
            {hasActiveFilters && (
              <Grid item>
                <FormControlLabel
                  control={
                    <Switch checked={showFilteredOut} onChange={onSetShowFilteredOut} color="primary" size="small" />
                  }
                  label="Show Filtered Events"
                />
              </Grid>
            )}
            <Grid item>
              <FormControlLabel
                control={<Switch checked={showTimeGrid} onChange={onToggleTimeGrid} color="primary" size="small" />}
                label="Grid"
              />
            </Grid>
            <Grid item>
              <FormControlLabel
                control={
                  <Switch checked={allowInteraction} onChange={onToggleAllowInteraction} color="primary" size="small" />
                }
                label="Zoom"
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs="auto">
          <Grid container alignItems={'flex-start'} spacing={1} className={classes.help}>
            <Grid item>
              {allowInteraction ? (
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
              ) : (
                <HelpIcon color="disabled" />
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  )
}

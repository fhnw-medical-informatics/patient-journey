import React, { useCallback, useEffect } from 'react'
import {
  Button,
  FormControl,
  FormControlLabel,
  Grid,
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
import { doesContainColumn } from '../../data/columns'
import { ColumnSortingState, ColumnSortingStateNeutral } from '../../data/sorting'
import { ArrowDownward, ArrowUpward } from '@mui/icons-material'
import { ColorByColumnSelector } from '../../color/containers/ColorByColumnSelector'

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
  sortByState: ColumnSortingState
  onSetSortByState: (state: ColumnSortingState) => void
  availableSortColumns: ReadonlyArray<EventDataColumn | PatientDataColumn>
  cluster: boolean
  onSetTimelineCluster: () => void
  showFilteredOut: boolean
  onSetShowFilteredOut: () => void
  showTimeGrid: boolean
  onToggleTimeGrid: () => void
  allowInteraction: boolean
  onToggleAllowInteraction: () => void
  availableColumns: ReadonlyArray<EventDataColumn | PatientDataColumn>
  hasActiveFilters: boolean
}

export const ControlPanel = ({
  viewByColumn,
  onSetViewByColumn,
  expandByColumn,
  onSetExpandByColumn,
  sortByState,
  availableSortColumns,
  onSetSortByState,
  cluster,
  showTimeGrid,
  onToggleTimeGrid,
  allowInteraction,
  onToggleAllowInteraction,
  onSetTimelineCluster,
  showFilteredOut,
  onSetShowFilteredOut,
  availableColumns,
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

  // Reset sortByState when availableSortColumns change
  useEffect(() => {
    if (sortByState.type !== 'neutral' && !doesContainColumn(availableSortColumns, sortByState.column)) {
      onSetSortByState(ColumnSortingStateNeutral)
    }
  }, [onSetSortByState, sortByState, availableSortColumns])

  const handleChangeViewByColumn = (event: SelectChangeEvent) => {
    onSetViewByColumn(availableColumns.find((column) => column.name === event.target.value) ?? TimelineColumnNone)
  }

  const handleChangeExpandByColumn = (event: SelectChangeEvent) => {
    onSetExpandByColumn(availableColumns.find((column) => column.name === event.target.value) ?? TimelineColumnNone)
  }

  const handleChangeSortByColumn = useCallback(
    (event: SelectChangeEvent) => {
      const column = availableSortColumns.find((column) => column.name === event.target.value) ?? TimelineColumnNone

      if (column === TimelineColumnNone) {
        onSetSortByState(ColumnSortingStateNeutral)
      } else {
        onSetSortByState({
          type: sortByState.type === 'neutral' ? 'asc' : sortByState.type,
          column,
        })
      }
    },
    [onSetSortByState, sortByState, availableSortColumns]
  )

  const handleChangeSortByDirection = useCallback(
    (direction: 'asc' | 'desc') => {
      if (sortByState.type !== 'neutral') {
        onSetSortByState({
          type: direction,
          column: sortByState.column,
        })
      }
    },
    [onSetSortByState, sortByState]
  )

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
                Sort by
              </Typography>
              <Grid container alignItems="center" gap={1}>
                <Grid item>
                  <FormControl disabled={expandByColumn === TimelineColumnNone}>
                    <Select
                      value={sortByState.type !== 'neutral' ? sortByState.column.name : TimelineColumnNone}
                      onChange={handleChangeSortByColumn}
                      size="small"
                    >
                      <MenuItem value={TimelineColumnNone}>
                        <i>{'None'}</i>
                      </MenuItem>
                      {availableSortColumns.map((column) => (
                        <MenuItem key={column.name} value={column.name}>
                          {column.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                {sortByState.type !== 'neutral' && (
                  <Grid item>
                    <Button
                      onClick={() => handleChangeSortByDirection(sortByState.type === 'asc' ? 'desc' : 'asc')}
                      variant="text"
                      color="inherit"
                      size="small"
                      startIcon={sortByState.type === 'asc' ? <ArrowUpward /> : <ArrowDownward />}
                    >
                      {sortByState.type === 'asc' ? 'ASC' : 'DESC'}
                    </Button>
                  </Grid>
                )}
              </Grid>
              <ColorByColumnSelector includeEventColumns={true} />
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

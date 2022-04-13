import React, { useMemo } from 'react'

import { darken, lighten, Paper, useTheme } from '@mui/material'

import { DataGrid, GridColumns, GridRow, GridRowProps } from '@mui/x-data-grid'

import { makeStyles } from '../../utils'

import { Entity, EntityId, EntityIdNone } from '../../data/entities'
import { DataColumn, formatMillis, stringToBoolean } from '../../data/columns'
import { ColorByColumnNone, ColorByColumnOption } from '../../color/colorSlice'
import { ColorByColumnFn } from '../../color/useColor'
import { ColumnSortingState, stableSort } from '../../data/sorting'

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'grid',
    width: '100%',
    height: '100%',
    placeItems: 'center',
  },
  maxed: {
    width: '100%',
    height: '100%',
  },
}))

interface Props {
  readonly rows: ReadonlyArray<Entity>
  readonly columns: ReadonlyArray<DataColumn<any>>
  readonly selectedEntity: EntityId
  readonly hoveredEntity: EntityId
  readonly onEntityClick: (id: EntityId) => void
  readonly onEntityHover: (id: EntityId) => void
  readonly colorByColumn: ColorByColumnOption
  readonly colorByColumnFn: ColorByColumnFn
  readonly sorting: ColumnSortingState
  readonly onSortingChange: (sortingState: ColumnSortingState) => void
}

export const DataTable = ({
  rows,
  columns,
  selectedEntity,
  hoveredEntity,
  sorting,
  onEntityClick,
  onEntityHover,
  onSortingChange,
  colorByColumn,
  colorByColumnFn,
}: Props) => {
  const theme = useTheme()
  const { classes } = useStyles()

  const dataGridColumns: GridColumns<Entity> = useMemo(
    () =>
      columns.map((column) => ({
        field: `${column.index}`,
        headerName: column.name,
        flex: 1,
        valueGetter: (params) => params.row.values[column.index],
        valueFormatter: (params) => {
          if (params.value === null || params.value.trim().length === 0) {
            return ''
          }
          switch (column.type) {
            case 'boolean':
              return stringToBoolean(params.value) ? 'X' : ''
            case 'timestamp':
              return formatMillis(+params.value)
            default:
              return params.value
          }
        },
      })),
    [columns]
  )

  // Use our own sorting logic for better performance (in combination with sortingMode: 'server' below)
  // https://github.com/fhnw-medical-informatics/patient-journey/issues/71#issuecomment-1098061773
  const sortedRows = useMemo(() => stableSort(rows, sorting).map((row) => ({ ...row, id: row.uid })), [rows, sorting])

  return (
    <Paper className={classes.root}>
      <div className={classes.maxed}>
        <DataGrid
          rows={sortedRows}
          columns={dataGridColumns}
          disableColumnFilter
          disableColumnMenu
          density="compact"
          selectionModel={selectedEntity !== EntityIdNone ? [selectedEntity] : []}
          onSelectionModelChange={(newSelectionModel) => {
            onEntityClick(newSelectionModel[0] as EntityId)
          }}
          sortingMode="server"
          sortModel={
            sorting.type !== 'neutral'
              ? [
                  {
                    field: `${sorting.column.index}`,
                    sort: sorting.type,
                  },
                ]
              : []
          }
          onSortModelChange={(newSortModel) => {
            if (newSortModel.length === 0) {
              onSortingChange({ type: 'neutral' })
            } else {
              const column = columns.find((column) => column.index === +newSortModel[0].field)

              if (column) {
                onSortingChange({
                  type: newSortModel[0].sort ?? 'neutral',
                  column,
                })
              } else {
                throw new Error(`Could not find sort column with index ${newSortModel[0].field}`)
              }
            }
          }}
          components={{
            Row: (props: React.HTMLAttributes<HTMLDivElement> & GridRowProps) => (
              <GridRow
                {...props}
                onMouseEnter={() => onEntityHover((props.row as Entity).uid)}
                onMouseLeave={() => onEntityHover(EntityIdNone)}
                style={{
                  ...props.style,
                  borderLeft:
                    colorByColumn !== ColorByColumnNone
                      ? `5px solid ${colorByColumnFn(props.row)}`
                      : '5px solid transparent',
                  backgroundColor:
                    colorByColumn !== ColorByColumnNone
                      ? theme.palette.mode === 'dark'
                        ? darken(
                            colorByColumnFn(props.row),
                            selectedEntity === props.row.uid || hoveredEntity === props.row.uid ? 0.2 : 0.6
                          )
                        : lighten(
                            colorByColumnFn(props.row),
                            selectedEntity === props.row.uid || hoveredEntity === props.row.uid ? 0.4 : 0.8
                          )
                      : '',
                }}
              />
            ),
          }}
          sx={{
            '& .MuiDataGrid-row.Mui-selected': {
              backgroundColor: theme.entityColors.selected,
            },
            '& .MuiDataGrid-row.Mui-selected:hover': {
              backgroundColor: theme.entityColors.selected,
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? darken(theme.entityColors.selected, 0.6)
                  : lighten(theme.entityColors.selected, 0.8),
            },
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
          }}
        />
      </div>
    </Paper>
  )
}

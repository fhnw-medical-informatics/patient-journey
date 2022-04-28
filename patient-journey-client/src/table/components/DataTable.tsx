import React, { useMemo } from 'react'

import { darken, lighten, Paper, useTheme } from '@mui/material'

import { DataGridPro, GridColumns, GridRow, GridRowProps, LicenseInfo } from '@mui/x-data-grid-pro'

import { makeStyles } from '../../utils'

import { Entity, EntityId, EntityIdNone } from '../../data/entities'
import { DataColumn, formatColumnValue } from '../../data/columns'
import { ColorByColumnNone, ColorByColumnOption } from '../../color/colorSlice'
import { ColorByColumnFn } from '../../color/hooks'
import { ColumnSortingState, stableSort } from '../../data/sorting'
import { ColoredCircle } from '../../color/components/ColoredCircle'

// https://mui.com/x/advanced-components/#license-key-installation
LicenseInfo.setLicenseKey(import.meta.env.VITE_APP_DATA_GRID_LICENSE_KEY)

const useStyles = makeStyles()({
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
})

interface Props {
  readonly rows: ReadonlyArray<Entity>
  readonly columns: ReadonlyArray<DataColumn<any>>
  readonly selectedEntity: EntityId
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
  sorting,
  selectedEntity,
  onEntityClick,
  onEntityHover,
  onSortingChange,
  colorByColumn,
  colorByColumnFn,
}: Props) => {
  const theme = useTheme()
  const { classes } = useStyles()

  const dataGridColumns: GridColumns<Entity> = useMemo(() => {
    let cols: GridColumns<Entity> = columns.map((column) => ({
      field: `${column.index}`,
      headerName: column.name,
      flex: 1,
      valueGetter: (params) => params.row.values[column.index],
      valueFormatter: (params) => formatColumnValue(column.type)(params.value),
    }))

    if (colorByColumn !== ColorByColumnNone) {
      cols = [
        {
          field: 'color',
          headerName: '',
          sortable: false,
          width: 30,
          renderCell: ({ row }) => <ColoredCircle color={colorByColumnFn(row)} />,
        },
        ...cols,
      ]
    }

    return cols
  }, [columns, colorByColumn, colorByColumnFn])

  // Use our own sorting logic for better performance (in combination with sortingMode: 'server' below)
  // https://github.com/fhnw-medical-informatics/patient-journey/issues/71#issuecomment-1098061773
  const sortedRows = useMemo(() => stableSort(rows, sorting).map((row) => ({ ...row, id: row.uid })), [rows, sorting])

  return (
    <Paper className={classes.root}>
      <div className={classes.maxed}>
        <DataGridPro
          rows={sortedRows}
          columns={dataGridColumns}
          disableColumnFilter
          disableColumnMenu
          density="compact"
          selectionModel={selectedEntity !== EntityIdNone ? [selectedEntity] : []}
          onSelectionModelChange={(newSelectionModel) => {
            if (newSelectionModel && newSelectionModel.length > 0 && newSelectionModel[0] !== undefined) {
              onEntityClick(newSelectionModel[0] as EntityId)
            }
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
                  backgroundColor:
                    colorByColumn !== ColorByColumnNone
                      ? theme.palette.mode === 'dark'
                        ? darken(colorByColumnFn(props.row), 0.6)
                        : lighten(colorByColumnFn(props.row), 0.8)
                      : '',
                }}
              />
            ),
          }}
          sx={{
            '& .MuiDataGrid-row.Mui-selected': {
              backgroundColor: `${theme.entityColors.selected} !important`, // override colored background from row
            },
            '& .MuiDataGrid-row.Mui-selected:hover': {
              backgroundColor: `${theme.entityColors.selected} !important`,
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: `${
                theme.palette.mode === 'dark'
                  ? darken(theme.entityColors.selected, 0.6)
                  : lighten(theme.entityColors.selected, 0.8)
              } !important`,
            },
            '& .MuiDataGrid-cell:focus, .MuiDataGrid-columnHeader:focus, .MuiDataGrid-columnHeader:focus-within': {
              outline: 'none',
            },
          }}
        />
      </div>
    </Paper>
  )
}

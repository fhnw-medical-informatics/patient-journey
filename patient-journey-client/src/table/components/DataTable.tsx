import React, { useMemo } from 'react'

import { Button, darken, IconButton, lighten, Paper, Tooltip, Typography, useTheme } from '@mui/material'

import StarIcon from '@mui/icons-material/Star'
import StarOutlinedIcon from '@mui/icons-material/StarOutline'
import CloseIcon from '@mui/icons-material/Close'

import { DataGridPro, GridColumns, GridFooterContainer, GridRow, GridRowProps, LicenseInfo } from '@mui/x-data-grid-pro'

import { makeStyles } from '../../utils'

import { Entity, EntityId, EntityIdNone } from '../../data/entities'
import { DataColumn, formatColumnValue } from '../../data/columns'
import { ColorByColumn } from '../../color/colorSlice'
import { ColorByColumnFn } from '../../color/hooks'
import { ColumnSortingState, stableSort } from '../../data/sorting'
import { ColoredCircle } from '../../color/components/ColoredCircle'
import { PatientId, PatientIdNone } from '../../data/patients'

// https://mui.com/x/advanced-components/#license-key-installation
LicenseInfo.setLicenseKey(import.meta.env.VITE_APP_DATA_GRID_LICENSE_KEY)

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
  footer: {
    padding: `0 ${theme.spacing(2)}`,
  },
}))

interface Props {
  readonly rows: ReadonlyArray<Entity>
  readonly columns: ReadonlyArray<DataColumn<any>>
  readonly selectedEntity: EntityId
  readonly onEntityClick: (id: EntityId) => void
  readonly onEntityHover: (id: EntityId) => void
  readonly colorByColumn: ColorByColumn
  readonly colorByColumnFn: ColorByColumnFn
  readonly sorting: ColumnSortingState
  readonly onSortingChange: (sortingState: ColumnSortingState) => void
  readonly indexPatientId: PatientId
  readonly onSetIndexPatient: (pid: PatientId) => void
  readonly onResetIndexPatient: () => void
  readonly enableIndexPatientColumn: boolean
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
  indexPatientId,
  onSetIndexPatient,
  onResetIndexPatient,
  enableIndexPatientColumn,
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

    if (enableIndexPatientColumn) {
      cols = [
        {
          field: 'indexPatient',
          headerName: '',
          sortable: false,
          width: 10,
          renderCell: ({ row }) => {
            const isIndexPatient = indexPatientId === row.uid

            return (
              <Tooltip
                enterDelay={150}
                enterNextDelay={1500}
                placement="right"
                arrow
                title={isIndexPatient ? 'Unset index patient' : 'Set as index patient'}
              >
                <IconButton
                  size="small"
                  className={isIndexPatient ? '' : 'idx-patient'}
                  onClick={(e) => {
                    e.stopPropagation()

                    if (isIndexPatient) {
                      onResetIndexPatient()
                    } else {
                      onSetIndexPatient(row.uid)
                    }
                  }}
                >
                  {isIndexPatient ? <StarIcon fontSize="inherit" /> : <StarOutlinedIcon fontSize="inherit" />}
                </IconButton>
              </Tooltip>
            )
          },
        },
        ...cols,
      ]
    }

    if (colorByColumn.type !== 'none') {
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
  }, [
    columns,
    colorByColumn.type,
    colorByColumnFn,
    onSetIndexPatient,
    indexPatientId,
    enableIndexPatientColumn,
    onResetIndexPatient,
  ])

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
                    colorByColumn.type !== 'none'
                      ? theme.palette.mode === 'dark'
                        ? darken(colorByColumnFn(props.row), 0.6)
                        : lighten(colorByColumnFn(props.row), 0.8)
                      : '',
                }}
              />
            ),
            Footer: () => (
              <GridFooterContainer className={classes.footer}>
                {indexPatientId !== PatientIdNone ? (
                  <Button
                    onClick={onResetIndexPatient}
                    variant="text"
                    size="small"
                    color="inherit"
                    endIcon={<CloseIcon />}
                  >
                    Index Patient: {indexPatientId}
                  </Button>
                ) : (
                  <span></span>
                )}
                {selectedEntity !== EntityIdNone ? (
                  <Typography variant="body2">1 Row selected</Typography>
                ) : (
                  <span></span>
                )}
                <Typography variant="body2">Total Rows: {rows.length}</Typography>
              </GridFooterContainer>
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
            '& .MuiDataGrid-row .idx-patient': {
              display: 'none',
            },
            '& .MuiDataGrid-row:hover .idx-patient': {
              display: 'inherit',
            },
          }}
        />
      </div>
    </Paper>
  )
}

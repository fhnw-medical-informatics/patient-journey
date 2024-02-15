import React, { useCallback, useMemo } from 'react'

import { Button, Paper, Stack, Typography, keyframes, useTheme } from '@mui/material'

import CloseIcon from '@mui/icons-material/Close'

import {
  DataGridPro,
  GridColumns,
  GridFooterContainer,
  GridPinnedRowsProp,
  GridRow,
  GridRowProps,
  LicenseInfo,
  useGridApiRef,
} from '@mui/x-data-grid-pro'

import { makeStyles } from '../../utils'

import { Entity, EntityId, EntityIdNone } from '../../data/entities'
import { DataColumn, formatColumnValue } from '../../data/columns'
import { ColorByColumn } from '../../color/colorSlice'
import { ColorByColumnFn } from '../../color/hooks'
import { ColumnSortingState, stableSort } from '../../data/sorting'
import { ColoredCircle } from '../../color/components/ColoredCircle'
import { PatientId, PatientIdNone } from '../../data/patients'
import { IndexPatientButton } from '../containers/IndexPatientButton'
import { ScrollToButton } from './ScrollToButton'
import { CohortControlButton } from '../../data/containers/cohort/CohortControlButton'

// https://mui.com/x/advanced-components/#license-key-installation
LicenseInfo.setLicenseKey(import.meta.env.VITE_APP_DATA_GRID_LICENSE_KEY)

const flash = (color1: string, color2: string) => keyframes`
0% {
  color: ${color1};
}
25% {
  color: ${color2};
}
50% {
  color: ${color1};
}
75% {
  color: ${color2};
}
100% {
  color: ${color1};
}
`

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
  selectedPatientRow: {
    fontWeight: 'bold',
    backgroundColor: 'transparent !important',
  },
  indexPatientRow: {
    fontWeight: 'bold',
  },
  highlightSelectedPatientRow: {
    fontWeight: 'bold',
    animation: `${flash(theme.palette.text.primary, theme.entityColors.selected)} 1s`,
    backgroundColor: `${theme.entityColors.default} !important`,
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
  onResetIndexPatient,
  enableIndexPatientColumn,
}: Props) => {
  const theme = useTheme()
  const { classes } = useStyles()

  const apiRef = useGridApiRef()

  const [flashRow, setFlashRow] = React.useState<EntityId>(EntityIdNone)

  const handleScrollToButtonClick = useCallback(() => {
    // Add this line to trigger the flash effect
    setFlashRow(selectedEntity)
    // Reset the flash state after the animation duration
    setTimeout(() => setFlashRow(EntityIdNone), 1000)
  }, [selectedEntity])

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
          renderCell: ({ row }) => <IndexPatientButton patientId={row.uid} />,
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
  }, [columns, colorByColumn.type, colorByColumnFn, enableIndexPatientColumn])

  // Use our own sorting logic for better performance (in combination with sortingMode: 'server' below)
  // https://github.com/fhnw-medical-informatics/patient-journey/issues/71#issuecomment-1098061773
  const sortedRows = useMemo(() => stableSort(rows, sorting).map((row) => ({ ...row, id: row.uid })), [rows, sorting])

  const pinnedRows = useMemo(() => {
    const pinnedRows: GridPinnedRowsProp = {
      top: sortedRows.filter((row) => row.uid === indexPatientId),
    }

    return pinnedRows
  }, [sortedRows, indexPatientId])

  return (
    <Paper variant="outlined" className={classes.root}>
      <div className={classes.maxed}>
        <DataGridPro
          apiRef={apiRef}
          rows={sortedRows}
          pinnedRows={pinnedRows}
          experimentalFeatures={{ rowPinning: true }}
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
          getRowClassName={(params) => {
            if (params.row.uid === indexPatientId) {
              return classes.indexPatientRow
            } else if (params.row.uid === flashRow) {
              return classes.highlightSelectedPatientRow
            } else if (params.row.uid === selectedEntity) {
              return classes.selectedPatientRow
            } else {
              return ''
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
                  color:
                    props.row.uid === indexPatientId
                      ? theme.entityColors.indexPatient
                      : props.row.uid === selectedEntity
                      ? theme.entityColors.selected
                      : colorByColumn.type !== 'none'
                      ? colorByColumnFn(props.row)
                      : theme.palette.text.primary,
                }}
              />
            ),
            Footer: () => (
              <GridFooterContainer className={classes.footer}>
                <Stack direction="row" spacing={1}>
                  {indexPatientId !== PatientIdNone ? (
                    <div style={{ color: theme.entityColors.indexPatient }}>
                      <Button
                        onClick={onResetIndexPatient}
                        variant="outlined"
                        size="small"
                        endIcon={<CloseIcon />}
                        color="inherit"
                        title="Reset Index Patient"
                        sx={{ lineHeight: 1 }}
                      >
                        Index Patient: {indexPatientId}
                      </Button>
                    </div>
                  ) : (
                    <span></span>
                  )}
                  {selectedEntity !== EntityIdNone ? (
                    <ScrollToButton
                      gridApiRef={apiRef}
                      rows={sortedRows}
                      entityId={selectedEntity}
                      label={`Selected Entity: ${selectedEntity}`}
                      color={theme.entityColors.selected}
                      title="Scroll to Selected Entity"
                      onClick={handleScrollToButtonClick}
                    />
                  ) : (
                    <span></span>
                  )}
                  <CohortControlButton />
                </Stack>
                <Typography variant="body2" color={theme.palette.text.primary}>
                  Total Rows: {rows.length}
                </Typography>
              </GridFooterContainer>
            ),
          }}
          sx={{
            '& .MuiDataGrid-row.Mui-selected:hover': {
              backgroundColor: `${theme.entityColors.default} !important`,
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: `${theme.entityColors.default} !important`,
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

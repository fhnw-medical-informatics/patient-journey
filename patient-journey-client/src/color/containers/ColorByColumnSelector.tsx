import { ColorByColumn, ColorByColumnNone, ColorByColumnOptionNone, setColorByColumn } from '../colorSlice'
import React, { useCallback, useEffect } from 'react'

import { ColorByColumnSelector as ColorByColumnSelectorComponent } from '../components/ColorByColumnSelector'
import { useEventDataColumns, usePatientDataColumns } from '../../data/hooks'
import { useColor } from '../hooks'
import { useAppDispatch } from '../../store'
import { doesContainColumn } from '../../data/columns'

export const ColorByColumnSelector = () => {
  const { colorByColumn } = useColor('patients')
  const eventDataColumns = useEventDataColumns()
  const patientDataColumns = usePatientDataColumns()

  const dispatch = useAppDispatch()
  const onChangeColorByColumn = useCallback(
    (colorByColumn: ColorByColumn) => dispatch(setColorByColumn(colorByColumn)),
    [dispatch]
  )

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

  return (
    <ColorByColumnSelectorComponent
      colorByColumn={colorByColumn}
      eventDataColumns={eventDataColumns}
      patientDataColumns={patientDataColumns}
      onChangeColorByColumn={onChangeColorByColumn}
    />
  )
}

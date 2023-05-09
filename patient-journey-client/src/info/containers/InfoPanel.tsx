import React, { useMemo } from 'react'
import { FocusEntityInfo, InfoPanel as InfoPanelComponent } from '../components/InfoPanel'
import {
  useEventDataEidColumn,
  useEventDataPidColumn,
  useEventDataPidValues,
  useEventDataTimestampColumn,
  useEventDataTimestampValuesFormatted,
  useFocusEntity,
  usePatientDataPidColumn,
} from '../../data/hooks'
import { PatientId } from '../../data/patients'
import { EventId } from '../../data/events'
import { useColorByInfo } from '../../color/hooks'
import { useScatterPlotInfo } from '../../plot/hooks'

export const InfoPanel = React.memo(() => {
  const patientDataPidColumnName = usePatientDataPidColumn().name

  const eventDataEidColumnName = useEventDataEidColumn().name
  const eventDataPidColumnName = useEventDataPidColumn().name
  const eventDataTimestampColumnName = useEventDataTimestampColumn().name
  const eventDataTimestampValueFn = useEventDataTimestampValuesFormatted()
  const eventDataPidValueFn = useEventDataPidValues()

  const focusEntity = useFocusEntity()

  const colorByInfo = useColorByInfo(focusEntity.type)
  const scatterPlotInfo = useScatterPlotInfo()

  const focusEntityInfo: FocusEntityInfo = useMemo(() => {
    switch (focusEntity.type) {
      case 'none':
        return { type: 'no-info' }
      case 'patients':
        return {
          type: 'patient-info',
          patientInfo: {
            pid: focusEntity.uid as PatientId,
            pidColumnName: patientDataPidColumnName,
          },
        }
      case 'events':
        return {
          type: 'event-info',
          patientInfo: {
            pid: eventDataPidValueFn(focusEntity.uid),
            pidColumnName: eventDataPidColumnName,
          },
          eventInfo: {
            eid: focusEntity.uid as EventId,
            eidColumnName: eventDataEidColumnName,
            timestampColumnName: eventDataTimestampColumnName,
            timestampValue: eventDataTimestampValueFn(focusEntity.uid),
          },
        }
    }
  }, [
    focusEntity.type,
    focusEntity.uid,
    patientDataPidColumnName,
    eventDataPidValueFn,
    eventDataPidColumnName,
    eventDataEidColumnName,
    eventDataTimestampColumnName,
    eventDataTimestampValueFn,
  ])
  return (
    <InfoPanelComponent
      focusEntityInfo={focusEntityInfo}
      colorByInfo={colorByInfo(focusEntity.uid)}
      scatterPlotInfo={scatterPlotInfo}
    />
  )
})

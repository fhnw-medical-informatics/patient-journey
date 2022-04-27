import React, { useMemo } from 'react'
import { FocusEntityInfo, InfoPanel as InfoPanelComponent } from '../../components/info/InfoPanel'
import {
  useCrossFilteredEventData,
  useEventDataEidColumn,
  useEventDataPidColumn,
  useEventDataTimestampColumn,
  useEventDataTimestampValuesFormatted,
  useFocusEntity,
  usePatientDataPidColumn,
} from '../../hooks'
import { PatientId } from '../../patients'
import { EventId } from '../../events'

export const InfoPanel = () => {
  const patientDataPidColumn = usePatientDataPidColumn()

  const eventData = useCrossFilteredEventData()
  const eventDataEidColumn = useEventDataEidColumn()
  const eventDataPidColumn = useEventDataPidColumn()
  const eventDataTimestampColumnName = useEventDataTimestampColumn().name
  const eventDataTimestampValueFn = useEventDataTimestampValuesFormatted()

  const focusEntity = useFocusEntity()
  const focusEntityInfo: FocusEntityInfo = useMemo(() => {
    switch (focusEntity.type) {
      case 'none':
        return { type: 'no-info' }
      case 'patient':
        return {
          type: 'patient-info',
          patientInfo: {
            pid: focusEntity.uid as PatientId,
            pidColumnName: patientDataPidColumn.name,
          },
        }
      case 'event':
        return {
          type: 'event-info',
          patientInfo: {
            pid: eventData.find((e) => e.uid === focusEntity.uid)!['pid'] as PatientId,
            pidColumnName: eventDataPidColumn.name,
          },
          eventInfo: {
            eid: focusEntity.uid as EventId,
            eidColumnName: eventDataEidColumn.name,
            timestampColumnName: eventDataTimestampColumnName,
            timestampValue: eventDataTimestampValueFn(focusEntity.uid),
          },
        }
    }
  }, [
    focusEntity.type,
    focusEntity.uid,
    patientDataPidColumn.name,
    eventData,
    eventDataPidColumn.name,
    eventDataEidColumn.name,
    eventDataTimestampColumnName,
    eventDataTimestampValueFn,
  ])
  return <InfoPanelComponent focusEntityInfo={focusEntityInfo} />
}

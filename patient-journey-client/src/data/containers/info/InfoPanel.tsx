import React, { useMemo } from 'react'
import { FocusEntityInfo, InfoPanel as InfoPanelComponent } from '../../components/info/InfoPanel'
import {
  useCrossFilteredEventData,
  useEventDataEidColumn,
  useEventDataPidColumn,
  useEventDataTimestampColumn,
  useFocusEntity,
  usePatientDataPidColumn,
} from '../../hooks'
import { PatientId } from '../../patients'
import { EventId } from '../../events'
import { formatColumnValue } from '../../columns'

export const InfoPanel = () => {
  const patientDataPidColumn = usePatientDataPidColumn()

  const eventData = useCrossFilteredEventData()
  const eventDataEidColumn = useEventDataEidColumn()
  const eventDataPidColumn = useEventDataPidColumn()
  const eventTimestampColumn = useEventDataTimestampColumn()

  const focusEntity = useFocusEntity()
  const formatTimestamp = formatColumnValue(eventTimestampColumn!.type)
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
            timestampColumnName: eventTimestampColumn.name,
            timestampValue: formatTimestamp(
              eventData.find((e) => e.uid === focusEntity.uid)!.values[eventTimestampColumn.index]
            ),
          },
        }
    }
  }, [
    focusEntity,
    patientDataPidColumn.name,
    eventData,
    eventDataPidColumn.name,
    eventDataEidColumn.name,
    eventTimestampColumn.name,
    eventTimestampColumn.index,
    formatTimestamp,
  ])
  return <InfoPanelComponent focusEntityInfo={focusEntityInfo} />
}

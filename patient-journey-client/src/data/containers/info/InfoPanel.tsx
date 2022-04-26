import React from 'react'
import { ActiveEntityInfo, InfoPanel as InfoPanelComponent } from '../../components/info/InfoPanel'
import {
  useActiveDataView,
  useActiveEntity,
  useCrossFilteredEventData,
  useCrossFilteredPatientData,
  useEidColumn,
  useEventTimestampColumn,
  usePidColumnName,
} from '../../hooks'
import { PatientId } from '../../patients'
import { EventId } from '../../events'
import { EntityIdNone } from '../../entities'
import { formatColumnValue } from '../../columns'

export const InfoPanel = () => {
  const patientData = useCrossFilteredPatientData()
  const pidColumnName = usePidColumnName()

  const eventData = useCrossFilteredEventData()
  const eidColumn = useEidColumn()
  const eventTimestampColumn = useEventTimestampColumn()

  const view = useActiveDataView()
  const activeEntity = useActiveEntity()
  const formatTimestamp = formatColumnValue(eventTimestampColumn.type)
  const activeEntityInfo: ActiveEntityInfo =
    activeEntity === EntityIdNone
      ? { type: 'no-info' }
      : view === 'patients'
      ? {
          type: 'patient-info',
          patientInfo: {
            pid: activeEntity as PatientId,
            pidColumnName,
          },
        }
      : {
          type: 'event-info',
          patientInfo: {
            pid: patientData.find((e) => e.uid === activeEntity)!['pid'] as PatientId,
            pidColumnName,
          },
          eventInfo: {
            eid: activeEntity as EventId,
            eidColumnName: eidColumn?.name ?? 'Event ID',
            timestampColumnName: eventTimestampColumn.name,
            timestampValue: formatTimestamp(
              eventData.find((e) => e.uid === activeEntity)!.values[eventTimestampColumn.index]
            ),
          },
        }
  return <InfoPanelComponent activeEntityInfo={activeEntityInfo} />
}

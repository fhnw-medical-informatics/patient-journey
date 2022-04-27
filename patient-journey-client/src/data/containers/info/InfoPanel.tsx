import React, { useMemo } from 'react'
import { FocusEntityInfo, InfoPanel as InfoPanelComponent } from '../../components/info/InfoPanel'
import {
  useEventDataEidColumn,
  useEventDataPidColumn,
  useEventDataPidValues,
  useEventDataTimestampColumn,
  useEventDataTimestampValuesFormatted,
  useFocusEntity,
  usePatientDataPidColumn,
} from '../../hooks'
import { PatientId } from '../../patients'
import { EventId } from '../../events'

export const InfoPanel = () => {
  const patientDataPidColumnName = usePatientDataPidColumn().name

  const eventDataEidColumnName = useEventDataEidColumn().name
  const eventDataPidColumnName = useEventDataPidColumn().name
  const eventDataTimestampColumnName = useEventDataTimestampColumn().name
  const eventDataTimestampValueFn = useEventDataTimestampValuesFormatted()
  const eventDataPidValueFn = useEventDataPidValues()

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
            pidColumnName: patientDataPidColumnName,
          },
        }
      case 'event':
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
  return <InfoPanelComponent focusEntityInfo={focusEntityInfo} />
}

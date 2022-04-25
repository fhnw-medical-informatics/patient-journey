import React from 'react'
import { ActiveEntityInfo, InfoPanel as InfoPanelComponent } from '../../components/info/InfoPanel'
import { useActiveData, useActiveDataView, useActiveEntity, useEidColumnName, usePidColumnName } from '../../hooks'
import { PatientId } from '../../patients'
import { EventId } from '../../events'
import { EntityIdNone } from '../../entities'

export const InfoPanel = () => {
  const pidColumnName = usePidColumnName()
  const eidColumnName = useEidColumnName()
  const data = useActiveData()
  const view = useActiveDataView()
  const activeEntity = useActiveEntity()
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
            pid: data.find((e) => e.uid === activeEntity)!['pid'] as PatientId,
            pidColumnName,
          },
          eventInfo: {
            eid: activeEntity as EventId,
            eidColumnName,
          },
        }
  return <InfoPanelComponent activeEntityInfo={activeEntityInfo} />
}

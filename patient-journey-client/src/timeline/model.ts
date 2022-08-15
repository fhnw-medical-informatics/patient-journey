import { TimelineEvent } from 'react-svg-timeline'

export interface TimelineEventWithPID<EID extends string, PatientId extends string>
  extends TimelineEvent<EID, PatientId> {
  pid: PatientId
}

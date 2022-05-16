import { CustomLayerProps, TimelineEvent } from 'react-svg-timeline'
import { EventId } from '../../data/events'

export type PatientJourneyTimelineEvent<LID extends string> = TimelineEvent<EventId, LID>
export type PatientJourneyCustomLayerProps<LID extends string> = CustomLayerProps<
  EventId,
  LID,
  PatientJourneyTimelineEvent<LID>
>

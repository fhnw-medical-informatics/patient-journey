import React from 'react'

import { CustomLayer, CustomLayerProps, TimelineEvent } from 'react-svg-timeline'
import { useEventDataPidValues, useFocusEntity, useIndexPatientId, useSplitPlaneResizing } from '../../data/hooks'
import { PatientIdNone } from '../../data/patients'

import { TimelineJourneys as TimelineJourneysComponent } from '../components/TimelineJourneys'
import { useActiveDataAsEventsWithoutColor, useExpandByColumn } from '../hooks'
import { TimelineColumnNone } from '../timelineSlice'

// TODO: Type this properly to avoid injecting events with pid
// type CustomLayerWithPID = <EID extends string, LID extends string, E extends TimelineEventWithPID<EID, LID>>(
//   props: CustomLayerProps<EID, LID, E>
// ) => React.ReactNode

const TimelineJourneys = <EID extends string, PatientId extends string, E extends TimelineEvent<EID, PatientId>>(
  props: CustomLayerProps<EID, PatientId, E>
) => {
  const isPaneResizing = useSplitPlaneResizing()
  const expandByColumn = useExpandByColumn()
  const events = useActiveDataAsEventsWithoutColor()
  const focusEntity = useFocusEntity()
  const indexPatientId = useIndexPatientId()
  const eventDataPidValueFn = useEventDataPidValues()

  return (
    <TimelineJourneysComponent
      {...props}
      isPaneResizing={isPaneResizing}
      isExpandedByPatientId={expandByColumn !== TimelineColumnNone && expandByColumn.type === 'pid'}
      eventsWithPID={events}
      focusPatientId={
        focusEntity.type === 'patients'
          ? focusEntity.uid
          : focusEntity.type === 'events'
          ? eventDataPidValueFn(focusEntity.uid)
          : PatientIdNone
      }
      indexPatientId={indexPatientId}
    />
  )
}

// A passthrough component is needed to prevent the whole timeline from re-rendering
// when the container hooks change.
export const TimelineJourneysLayer: CustomLayer = (props) => {
  return <TimelineJourneys {...props} />
}

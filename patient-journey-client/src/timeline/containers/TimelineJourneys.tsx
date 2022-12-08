import { useTheme } from '@mui/material'
import React from 'react'

import { CustomLayer, CustomLayerProps, TimelineEvent } from 'react-svg-timeline'
import { useColor } from '../../color/hooks'
import { Entity } from '../../data/entities'
import {
  useEventDataPidValues,
  useHoveredEntity,
  useIndexPatientId,
  usePatientDataRowAsMap,
  useSelectedEntity,
  useSplitPlaneResizing,
} from '../../data/hooks'
import { PatientIdNone } from '../../data/patients'

import { TimelineJourneys as TimelineJourneysComponent } from '../components/TimelineJourneys'
import { useActiveDataAsEventsForJourney, useExpandByColumn } from '../hooks'
import { TimelineColumnNone } from '../timelineSlice'

// TODO: Type this properly to avoid injecting events with pid
// type CustomLayerWithPID = <EID extends string, LID extends string, E extends TimelineEventWithPID<EID, LID>>(
//   props: CustomLayerProps<EID, LID, E>
// ) => React.ReactNode

const TimelineJourneys = <EID extends string, PatientId extends string, E extends TimelineEvent<EID, PatientId>>(
  props: CustomLayerProps<EID, PatientId, E>
) => {
  const theme = useTheme()

  const { colorByColumnFn } = useColor('events')
  const { colorByColumnFn: colorByColumnPatientsFn } = useColor('patients')

  const isPaneResizing = useSplitPlaneResizing()
  const expandByColumn = useExpandByColumn()
  const events = useActiveDataAsEventsForJourney(colorByColumnFn, theme.entityColors.filteredOut)
  const hoveredEntity = useHoveredEntity()
  const selectedEntity = useSelectedEntity()
  const indexPatientId = useIndexPatientId()
  const eventDataPidValueFn = useEventDataPidValues()

  const patientDataAsMap = usePatientDataRowAsMap() as Map<PatientId, Entity>

  return (
    <TimelineJourneysComponent
      {...props}
      isPaneResizing={isPaneResizing}
      isExpandedByPatientId={expandByColumn !== TimelineColumnNone && expandByColumn.type === 'pid'}
      eventsWithPID={events}
      hoveredPatientId={
        hoveredEntity.type === 'patients'
          ? hoveredEntity.uid
          : hoveredEntity.type === 'events'
          ? eventDataPidValueFn(hoveredEntity.uid)
          : PatientIdNone
      }
      // TODO: REmove duplicate code
      selectedPatientId={
        selectedEntity.type === 'patients'
          ? selectedEntity.uid
          : selectedEntity.type === 'events'
          ? eventDataPidValueFn(selectedEntity.uid)
          : PatientIdNone
      }
      indexPatientId={indexPatientId}
      colorByColumnFn={colorByColumnPatientsFn}
      patientMap={patientDataAsMap}
    />
  )
}

// A passthrough component is needed to prevent the whole timeline from re-rendering
// when the container hooks change.
export const TimelineJourneysLayer: CustomLayer = (props) => {
  return <TimelineJourneys {...props} />
}

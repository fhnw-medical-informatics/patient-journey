import React, { useMemo } from 'react'
import { useTheme } from '@mui/material'

import { CustomLayerProps, TimelineEvent } from 'react-svg-timeline'
import { EntityId, EntityIdNone } from '../../data/entities'
import { calcMarkSize, SvgMark } from './SvgMark'
import { createFocusColor } from '../../theme/useCustomTheme'
import { PatientJourneyEvent } from '../../data/events'

// drawing active mark slightly bigger, to pronounce interactivity (micro-animate the size-up?)
const TIMELINE_MARK_INTERACTIVITY_GROWTH_FACTOR = 1.2

interface TimelineActiveMarksProps<
  EID extends string,
  PatientId extends string,
  E extends TimelineEvent<EID, PatientId>
> extends CustomLayerProps<EID, PatientId, E> {
  selectedEvent: TimelineEvent<EID, PatientId> | undefined
  hoveredEvent: TimelineEvent<EID, PatientId> | undefined
  indexPatientEvents: ReadonlyArray<PatientJourneyEvent>
  selectedColor: string
  onHover: (eventId: EntityId) => void
  onSelect: (eventId: EntityId) => void
}

export const TimelineActiveMarks = <
  EID extends string,
  PatientId extends string,
  E extends TimelineEvent<EID, PatientId>
>({
  yScale,
  xScale,
  laneDisplayMode,
  height,
  selectedEvent,
  hoveredEvent,
  selectedColor,
  indexPatientEvents,
  onHover,
  onSelect,
}: TimelineActiveMarksProps<EID, PatientId, E>) => {
  const theme = useTheme()

  const laneHeight = yScale.bandwidth()
  const markSize = useMemo(
    () => TIMELINE_MARK_INTERACTIVITY_GROWTH_FACTOR * calcMarkSize(laneDisplayMode, laneHeight),
    [laneDisplayMode, laneHeight]
  )

  const createCirce = (event: TimelineEvent<EID, PatientId>, strokeColor: string) => {
    const x = Math.round(xScale(event.startTimeMillis))
    const y = Math.round(laneDisplayMode === 'collapsed' ? height / 2 : yScale(event.laneId) ?? height / 2)

    return (
      <g transform={`translate(${x}, ${y})`}>
        <SvgMark
          size={markSize}
          color={event.color ?? theme.entityColors.default}
          stroke={strokeColor}
          onClick={(e: React.MouseEvent<SVGCircleElement, MouseEvent>) => {
            // Prevent click propagation, so that timeline click handler
            // does not get triggered (used for patient selection via lane click)
            e.stopPropagation()
            onSelect(event.eventId as EntityId)
          }}
          onMouseEnter={() => onHover(event.eventId as EntityId)}
          onMouseLeave={() => onHover(EntityIdNone)}
        />
      </g>
    )
  }

  return (
    <>
      {selectedEvent && selectedEvent === hoveredEvent ? (
        <>{createCirce(selectedEvent, createFocusColor(theme, selectedColor))}</>
      ) : (
        <>
          {hoveredEvent &&
            createCirce(
              hoveredEvent,
              createFocusColor(
                theme,
                indexPatientEvents.findIndex((e) => e.eid === hoveredEvent.eventId) !== -1
                  ? theme.entityColors.indexPatient
                  : hoveredEvent.color ?? theme.entityColors.default
              )
            )}
          {selectedEvent && createCirce(selectedEvent, selectedColor)}
        </>
      )}
    </>
  )
}

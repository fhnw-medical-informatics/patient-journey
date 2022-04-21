import { createSelector } from '@reduxjs/toolkit'
import { TimelineEvent, TimelineLane } from 'react-svg-timeline'
import { ColorByCategoryFn, ColorByColumnFn } from '../color/useColor'
import { stringToMillis } from '../data/columns'
import { Entity, EntityId } from '../data/entities'
import { PatientId } from '../data/patients'
import {
  selectActiveDataColumns,
  selectFilteredActiveData,
  selectHoveredActiveEntity,
  selectSelectedActiveEntity,
} from '../data/selectors'
import { RootState } from '../store'
import { CursorPosition, TimelineColumn, TimelineColumnNone, TimelineState } from './timelineSlice'

export const selectTimelineState = (s: RootState): TimelineState => s.timeline

const selectViewByColumn = (s: RootState): TimelineColumn => s.timeline.viewByColumn

const selectExpandByColumn = (s: RootState): TimelineColumn => s.timeline.expandByColumn

export const selectFilteredActiveDataAsEvents = createSelector(
  selectViewByColumn,
  selectExpandByColumn,
  selectActiveDataColumns,
  selectFilteredActiveData,
  (viewByColumn, expandByColumn, activeColumns, activeData) => (colorByColumnFn: ColorByColumnFn) =>
    viewByColumn !== TimelineColumnNone &&
    activeColumns.findIndex((column) => column.name === viewByColumn.name && column.index === viewByColumn.index) !== -1
      ? (activeData.map((event) => ({
          eventId: event.uid,
          laneId: expandByColumn === TimelineColumnNone ? event.pid : event.values[expandByColumn.index],
          isPinned: false,
          color: colorByColumnFn(event),
          startTimeMillis:
            viewByColumn.type === 'date'
              ? stringToMillis(event.values[viewByColumn.index])
              : +event.values[viewByColumn.index],
        })) as ReadonlyArray<TimelineEvent<EntityId, any>>)
      : []
)

const selectFilteredActiveEventsAsMap = createSelector(
  selectFilteredActiveDataAsEvents,
  (events) => (selectedColor: string) => {
    const eventMap = new Map<EntityId, TimelineEvent<EntityId, any>>()

    events(() => selectedColor).forEach((event) => {
      eventMap.set(event.eventId, event)
    })

    return eventMap
  }
)

export const selectSelectedActiveEntityAsEvent = createSelector(
  selectFilteredActiveEventsAsMap,
  selectSelectedActiveEntity,
  (eventMap, selectedEntity) => (selectedColor: string) => {
    const event = eventMap(selectedColor).get(selectedEntity)

    return event ? { ...event, color: selectedColor } : undefined
  }
)

export const selectHoveredActiveEntityAsEvent = createSelector(
  selectFilteredActiveEventsAsMap,
  selectHoveredActiveEntity,
  (eventMap, hoveredEntity) => (selectedColor: string) => {
    const event = eventMap(selectedColor).get(hoveredEntity)

    return event ? { ...event, color: selectedColor } : undefined
  }
)

export const selectFilteredActiveDataAsLanes = createSelector(
  selectExpandByColumn,
  selectFilteredActiveData,
  (expandByColumn, activeData) => (colorByCategoryFn: ColorByCategoryFn) =>
    Array.from(
      new Set(
        (activeData as ReadonlyArray<Entity & { pid: PatientId }>).map((event) =>
          expandByColumn === TimelineColumnNone ? event.pid : event.values[expandByColumn.index]
        )
      )
    ).map((value) => ({
      laneId: value,
      label: value, // TODO: Proper label
      color: expandByColumn !== TimelineColumnNone ? colorByCategoryFn(value) : undefined,
    })) as ReadonlyArray<TimelineLane<any>>
)

export const selectCursorPosition = (s: RootState): CursorPosition => s.timeline.cursorPosition

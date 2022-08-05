import { ColorByCategoryFn, ColorByColumnFn } from '../color/hooks'
import { useAppSelector } from '../store'

import {
  selectExpandByColumn,
  selectViewByColumn,
  selectShowFilteredOut,
  selectTimelineCluster,
  selectCursorPosition,
  selectSelectedActiveEvent,
  selectHoveredActiveEvent,
  selectFocusLaneId,
  selectShowTimeGrid,
  selectFilteredEventDataAsTimelineEvents,
  selectFilteredEventDataAsTimelineLanes,
  selectFilteredEventDataAsTimelineEventsWithoutColor,
} from './selectors'

export const useTimelineCluster = () => useAppSelector(selectTimelineCluster)

export const useShowTimeGrid = () => useAppSelector(selectShowTimeGrid)

export const useViewByColumn = () => useAppSelector(selectViewByColumn)

export const useExpandByColumn = () => useAppSelector(selectExpandByColumn)

export const useShowFilteredOut = () => useAppSelector(selectShowFilteredOut)

export const useTimelineCursorPosition = () => useAppSelector(selectCursorPosition)

export const useActiveDataAsEvents = (
  colorByColumnFn: ColorByColumnFn,
  filteredOutColor: string,
  indexPatientColor: string
) =>
  useAppSelector((state) =>
    selectFilteredEventDataAsTimelineEvents(state, colorByColumnFn, filteredOutColor, indexPatientColor)
  )

export const useActiveDataAsEventsWithoutColor = () =>
  useAppSelector(selectFilteredEventDataAsTimelineEventsWithoutColor)

export const useSelectedActiveEvent = () => useAppSelector(selectSelectedActiveEvent)

export const useHoveredActiveEvent = () => useAppSelector(selectHoveredActiveEvent)

export const useActiveDataAsLanes = (colorByCategoryFn: ColorByCategoryFn) =>
  useAppSelector((state) => selectFilteredEventDataAsTimelineLanes(state, colorByCategoryFn))

export const useFocusLaneId = () => useAppSelector(selectFocusLaneId)

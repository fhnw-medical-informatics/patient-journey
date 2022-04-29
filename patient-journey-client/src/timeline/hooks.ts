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
  selectActiveDataAsEvents,
  selectActiveDataAsLanes,
} from './selectors'

export const useTimelineCluster = () => useAppSelector(selectTimelineCluster)

export const useShowTimeGrid = () => useAppSelector(selectShowTimeGrid)

export const useViewByColumn = () => useAppSelector(selectViewByColumn)

export const useExpandByColumn = () => useAppSelector(selectExpandByColumn)

export const useShowFilteredOut = () => useAppSelector(selectShowFilteredOut)

export const useTimlineCursorPosition = () => useAppSelector(selectCursorPosition)

export const useActiveDataAsEvents = (colorByColumnFn: ColorByColumnFn) =>
  useAppSelector((state) => selectActiveDataAsEvents(state, colorByColumnFn))

export const useSelectedActiveEvent = () => useAppSelector(selectSelectedActiveEvent)

export const useHoveredActiveEvent = () => useAppSelector(selectHoveredActiveEvent)

export const useActiveDataAsLanes = (colorByCategoryFn: ColorByCategoryFn) =>
  useAppSelector((state) => selectActiveDataAsLanes(state, colorByCategoryFn))

export const useFocusLaneId = () => useAppSelector(selectFocusLaneId)

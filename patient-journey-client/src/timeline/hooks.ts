import { ColorByCategoryFn, ColorByColumnFn } from '../color/hooks'
import { useAppSelector } from '../store'

import {
  selectFilteredActiveDataAsEvents,
  selectFilteredActiveDataAsLanes,
  selectExpandByColumn,
  selectViewByColumn,
  selectShowFilteredOut,
  selectTimelineCluster,
  selectCursorPosition,
  selectSelectedActiveEvent,
  selectHoveredActiveEvent,
} from './selectors'

export const useTimelineCluster = () => useAppSelector(selectTimelineCluster)

export const useViewByColumn = () => useAppSelector(selectViewByColumn)

export const useExpandByColumn = () => useAppSelector(selectExpandByColumn)

export const useShowFilteredOut = () => useAppSelector(selectShowFilteredOut)

export const useTimlineCursorPosition = () => useAppSelector(selectCursorPosition)

export const useActiveDataAsEvents = (colorByColumnFn: ColorByColumnFn) =>
  useAppSelector((state) => selectFilteredActiveDataAsEvents(state, colorByColumnFn))

export const useSelectedActiveEvent = () => useAppSelector(selectSelectedActiveEvent)

export const useHoveredActiveEvent = () => useAppSelector(selectHoveredActiveEvent)

export const useActiveDataAsLanes = (colorByCategoryFn: ColorByCategoryFn) =>
  useAppSelector((state) => selectFilteredActiveDataAsLanes(state, colorByCategoryFn))

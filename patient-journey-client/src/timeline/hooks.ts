import { ColorByCategoryFn, ColorByColumnFn } from '../color/useColor'
import { useAppSelector } from '../store'

import {
  selectFilteredActiveDataAsEvents,
  selectFilteredActiveDataAsLanes,
  selectExpandByColumn,
  selectViewByColumn,
  selectTimelineCluster,
  selectCursorPosition,
  selectSelectedActiveEntityAsEvent,
  selectHoveredActiveEntityAsEvent,
} from './selectors'

export const useTimelineCluster = () => useAppSelector(selectTimelineCluster)

export const useViewByColumn = () => useAppSelector(selectViewByColumn)

export const useExpandByColumn = () => useAppSelector(selectExpandByColumn)

export const useTimlineCursorPosition = () => useAppSelector(selectCursorPosition)

export const useActiveDataAsEvents = (colorByColumnFn: ColorByColumnFn) =>
  useAppSelector((state) => selectFilteredActiveDataAsEvents(state, colorByColumnFn))

export const useSelectedActiveEntityAsEvent = () => useAppSelector(selectSelectedActiveEntityAsEvent)

export const useHoveredActiveEntityAsEvent = () => useAppSelector(selectHoveredActiveEntityAsEvent)

export const useActiveDataAsLanes = (colorByCategoryFn: ColorByCategoryFn) =>
  useAppSelector((state) => selectFilteredActiveDataAsLanes(state, colorByCategoryFn))

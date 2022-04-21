import { ColorByCategoryFn, ColorByColumnFn } from '../color/useColor'
import { useAppSelector } from '../store'

import {
  selectFilteredActiveDataAsEvents,
  selectFilteredActiveDataAsLanes,
  selectTimelineState,
  selectCursorPosition,
  selectSelectedActiveEntityAsEvent,
  selectHoveredActiveEntityAsEvent,
} from './selectors'

export const useTimelineState = () => useAppSelector(selectTimelineState)

export const useTimlineCursorPosition = () => useAppSelector(selectCursorPosition)

export const useActiveDataAsEvents = (colorByColumnFn: ColorByColumnFn) =>
  useAppSelector((state) => selectFilteredActiveDataAsEvents(state, colorByColumnFn))

export const useSelectedActiveEntityAsEvent = () => useAppSelector(selectSelectedActiveEntityAsEvent)

export const useHoveredActiveEntityAsEvent = () => useAppSelector(selectHoveredActiveEntityAsEvent)

export const useActiveDataAsLanes = (colorByCategoryFn: ColorByCategoryFn) =>
  useAppSelector((state) => selectFilteredActiveDataAsLanes(state, colorByCategoryFn))

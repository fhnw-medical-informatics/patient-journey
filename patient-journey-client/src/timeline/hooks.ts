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

export const useSelectedActiveEntityAsEvent = (colorByColumnFn: ColorByColumnFn) =>
  useAppSelector((state) => selectSelectedActiveEntityAsEvent(state, colorByColumnFn))

export const useHoveredActiveEntityAsEvent = (colorByColumnFn: ColorByColumnFn) =>
  useAppSelector((state) => selectHoveredActiveEntityAsEvent(state, colorByColumnFn))

export const useActiveDataAsLanes = (colorByCategoryFn: ColorByCategoryFn) =>
  useAppSelector(selectFilteredActiveDataAsLanes)(colorByCategoryFn)

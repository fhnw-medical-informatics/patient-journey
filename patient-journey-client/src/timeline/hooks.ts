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
  useAppSelector(selectFilteredActiveDataAsEvents)(colorByColumnFn)

export const useSelectedActiveEntityAsEvent = (selectedColor: string) =>
  useAppSelector(selectSelectedActiveEntityAsEvent)(selectedColor)

export const useHoveredActiveEntityAsEvent = (selectedColor: string) =>
  useAppSelector(selectHoveredActiveEntityAsEvent)(selectedColor)

export const useActiveDataAsLanes = (colorByCategoryFn: ColorByCategoryFn) =>
  useAppSelector(selectFilteredActiveDataAsLanes)(colorByCategoryFn)

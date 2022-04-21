import { ColorByCategoryFn, ColorByColumnFn } from '../color/useColor'
import { useAppSelector } from '../store'

import {
  selectFilteredActiveDataAsEvents,
  selectFilteredActiveDataAsLanes,
  selectTimelineState,
  selectCursorPosition,
} from './selectors'

export const useTimelineState = () => useAppSelector(selectTimelineState)

export const useTimlineCursorPosition = () => useAppSelector(selectCursorPosition)

export const useActiveDataAsEvents = (colorByColumnFn: ColorByColumnFn, selectedColor: string) =>
  useAppSelector(selectFilteredActiveDataAsEvents)(colorByColumnFn, selectedColor)

export const useActiveDataAsLanes = (colorByCategoryFn: ColorByCategoryFn) =>
  useAppSelector(selectFilteredActiveDataAsLanes)(colorByCategoryFn)

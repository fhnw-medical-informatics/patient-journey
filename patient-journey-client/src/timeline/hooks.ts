import { ColorByCategoryFn, ColorByColumnFn } from '../color/useColor'
import { useAppSelector } from '../store'

import { selectFilteredActiveDataAsEvents, selectFilteredActiveDataAsLanes, selectTimelineState } from './selectors'

export const useTimelineState = () => useAppSelector(selectTimelineState)

export const useActiveDataAsEvents = (colorByColumnFn: ColorByColumnFn, selectedColor: string) =>
  useAppSelector(selectFilteredActiveDataAsEvents)(colorByColumnFn, selectedColor)

export const useActiveDataAsLanes = (colorByCategoryFn: ColorByCategoryFn) =>
  useAppSelector(selectFilteredActiveDataAsLanes)(colorByCategoryFn)

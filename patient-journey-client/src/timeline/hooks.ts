import { useAppSelector } from '../store'

import { selectFilteredActiveDataAsEvents, selectFilteredActiveDataAsLanes, selectTimelineState } from './selectors'

export const useTimelineState = () => useAppSelector(selectTimelineState)

export const useActiveDataAsEvents = () => useAppSelector(selectFilteredActiveDataAsEvents)

export const useActiveDataAsLanes = () => useAppSelector(selectFilteredActiveDataAsLanes)

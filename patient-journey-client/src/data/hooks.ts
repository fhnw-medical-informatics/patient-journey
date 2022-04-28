import { useAppDispatch, useAppSelector } from '../store'
import {
  selectActiveData,
  selectActiveDataByEntityIdMap,
  selectActiveDataColumns,
  selectActiveHoveredEventEntity,
  selectActiveSelectedEntity,
  selectActiveSelectedEventEntity,
  selectAllActiveDataCategories,
  selectAllFilters,
  selectCurrentColorColumnNumberRange,
  selectDataLoadingErrorMessage,
  selectDataLoadingState,
  selectDataView,
  selectEventDataEidColumn,
  selectEventDataPidColumn,
  selectEventDataPidValues,
  selectEventDataTimestampColumn,
  selectEventDataTimestampValuesFormatted,
  selectFilteredActiveData,
  selectFocusEntity,
  selectHoveredEntity,
  selectPatientDataPidColumn,
  selectSelectedEntity,
  selectTimelineDataColumns,
  selectUniqueActiveDataCategories,
} from './selectors'
import { setHoveredEntity, setSelectedEntity } from './dataSlice'
import { EntityId } from './entities'
import { DataColumn } from './columns'
import { useCallback } from 'react'

export const useDataLoadingState = () => useAppSelector(selectDataLoadingState)
export const useDataLoadingErrorMessage = () => useAppSelector(selectDataLoadingErrorMessage)

export const useActiveDataView = () => useAppSelector(selectDataView)

export const useActiveData = () => useAppSelector(selectActiveData)
export const useActiveDataByEntityIdMap = () => useAppSelector(selectActiveDataByEntityIdMap)
export const useFilteredActiveData = () => useAppSelector(selectFilteredActiveData)

export const useActiveDataColumns = () => useAppSelector(selectActiveDataColumns)
export const useTimelineDataColumns = () => useAppSelector(selectTimelineDataColumns)

export const useAllFilters = () => useAppSelector(selectAllFilters)

export const useHoveredEntity = () => useAppSelector(selectHoveredEntity)
export const useSelectedEntity = () => useAppSelector(selectSelectedEntity)
export const useFocusEntity = () => useAppSelector(selectFocusEntity)

export const useActiveSelectedEntity = () => useAppSelector(selectActiveSelectedEntity)
export const useActiveSelectedEventEntity = () => useAppSelector(selectActiveSelectedEventEntity)
export const useActiveHoveredEventEntity = () => useAppSelector(selectActiveHoveredEventEntity)

export interface EntityInteraction {
  readonly onEntityClick: (id: EntityId) => void
  readonly onEntityHover: (id: EntityId) => void
}

export const useActiveEntityInteraction = (): EntityInteraction => {
  const activeView = useActiveDataView()
  const type = activeView === 'patients' ? 'patient' : 'event'
  return useEntityInteraction(type)
}

export const useEntityInteraction = (type: 'patient' | 'event'): EntityInteraction => {
  const dispatch = useAppDispatch()

  const onEntityClick = useCallback(
    (uid: EntityId) => {
      dispatch(setSelectedEntity({ type, uid }))
    },
    [type, dispatch]
  )

  const onEntityHover = useCallback(
    (uid: EntityId) => {
      dispatch(setHoveredEntity({ type, uid }))
    },
    [type, dispatch]
  )

  return {
    onEntityClick,
    onEntityHover,
  }
}

export const usePatientDataPidColumn = () => useAppSelector(selectPatientDataPidColumn)
export const useEventDataEidColumn = () => useAppSelector(selectEventDataEidColumn)
export const useEventDataPidColumn = () => useAppSelector(selectEventDataPidColumn)
export const useEventDataTimestampColumn = () => useAppSelector(selectEventDataTimestampColumn)
export const useEventDataPidValues = () => useAppSelector(selectEventDataPidValues)
export const useEventDataTimestampValuesFormatted = () => useAppSelector(selectEventDataTimestampValuesFormatted)

export const useCurrentColorColumnNumberRange = () => useAppSelector(selectCurrentColorColumnNumberRange)

export const useAllActiveDataCategories = (column: DataColumn<'category'>) =>
  useAppSelector((state) => selectAllActiveDataCategories(state, column))

export const useUniqueActiveDataCategories = (column: DataColumn<'category'>) =>
  useAppSelector((state) => selectUniqueActiveDataCategories(state, column))

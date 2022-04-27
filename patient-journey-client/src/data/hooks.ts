import { useAppDispatch, useAppSelector } from '../store'
import {
  selectActiveData,
  selectActiveDataColumns,
  selectActiveHoveredEntity,
  selectActiveSelectedEntity,
  selectAllActiveDataCategories,
  selectAllFilters,
  selectCrossFilteredEventData,
  selectCrossFilteredPatientData,
  selectCurrentColorColumnNumberRange,
  selectDataLoadingErrorMessage,
  selectDataLoadingState,
  selectDataView,
  selectEventDataEidColumn,
  selectEventDataPidColumn,
  selectEventDataTimestampColumn,
  selectEventDataTimestampValueFormatted,
  selectFilteredActiveData,
  selectFocusEntity,
  selectHoveredEntity,
  selectPatientDataPidColumn,
  selectSelectedEntity,
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
export const useFilteredActiveData = () => useAppSelector(selectFilteredActiveData)
export const useCrossFilteredPatientData = () => useAppSelector(selectCrossFilteredPatientData)
export const useCrossFilteredEventData = () => useAppSelector(selectCrossFilteredEventData)

export const useActiveDataColumns = () => useAppSelector(selectActiveDataColumns)
export const useAllFilters = () => useAppSelector(selectAllFilters)

export const useHoveredEntity = () => useAppSelector(selectHoveredEntity)
export const useSelectedEntity = () => useAppSelector(selectSelectedEntity)
export const useFocusEntity = () => useAppSelector(selectFocusEntity)

export const useActiveSelectedEntity = () => useAppSelector(selectActiveSelectedEntity)
export const useActiveHoveredEntity = () => useAppSelector(selectActiveHoveredEntity)

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
export const useEventDataTimestampValuesFormatted = () => useAppSelector(selectEventDataTimestampValueFormatted)

export const useCurrentColorColumnNumberRange = () => useAppSelector(selectCurrentColorColumnNumberRange)

export const useAllActiveDataCategories = (column: DataColumn<'category'>) =>
  useAppSelector((state) => selectAllActiveDataCategories(state, column))

export const useUniqueActiveDataCategories = (column: DataColumn<'category'>) =>
  useAppSelector((state) => selectUniqueActiveDataCategories(state, column))

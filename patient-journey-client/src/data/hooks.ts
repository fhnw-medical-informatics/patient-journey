import { useAppDispatch, useAppSelector } from '../store'
import {
  selectActiveData,
  selectActiveDataColumns,
  selectActiveEntity,
  selectAllActiveDataCategories,
  selectAllFilters,
  selectCurrentColorColumnNumberRange,
  selectDataLoadingErrorMessage,
  selectDataLoadingState,
  selectDataView,
  selectEidColumnName,
  selectFilteredActiveData,
  selectHoveredActiveEntity,
  selectPidColumnName,
  selectSelectedActiveEntity,
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

export const useActiveDataColumns = () => useAppSelector(selectActiveDataColumns)
export const useAllFilters = () => useAppSelector(selectAllFilters)

export const useActiveSelectedEntity = () => useAppSelector(selectSelectedActiveEntity)
export const useActiveHoveredEntity = () => useAppSelector(selectHoveredActiveEntity)
export const useActiveEntity = () => useAppSelector(selectActiveEntity)

export const usePidColumnName = () => useAppSelector(selectPidColumnName)
export const useEidColumnName = () => useAppSelector(selectEidColumnName)

export interface EntityInteraction {
  readonly onEntityClick: (id: EntityId) => void
  readonly onEntityHover: (id: EntityId) => void
}

export const useEntityInteraction = (): EntityInteraction => {
  const dispatch = useAppDispatch()

  const onEntityClick = useCallback(
    (id: EntityId) => {
      dispatch(setSelectedEntity(id))
    },
    [dispatch]
  )

  const onEntityHover = useCallback(
    (id: EntityId) => {
      dispatch(setHoveredEntity(id))
    },
    [dispatch]
  )

  return {
    onEntityClick,
    onEntityHover,
  }
}

export const useCurrentColorColumnNumberRange = () => useAppSelector(selectCurrentColorColumnNumberRange)

export const useAllActiveDataCategories = (column: DataColumn<'category'>) =>
  useAppSelector((state) => selectAllActiveDataCategories(state, column))

export const useUniqueActiveDataCategories = (column: DataColumn<'category'>) =>
  useAppSelector((state) => selectUniqueActiveDataCategories(state, column))

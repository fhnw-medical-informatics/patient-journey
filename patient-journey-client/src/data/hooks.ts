import { useAppDispatch, useAppSelector } from '../store'
import {
  selectDataView,
  selectSelectedActiveEntity,
  selectHoveredActiveEntity,
  selectFilteredActiveData,
  selectActiveDataColumns,
  selectActiveData,
  selectAllFilters,
  selectCurrentColorColumnNumberRange,
  selectDataLoadingState,
  selectDataLoadingErrorMessage,
  selectAllActiveDataQualities,
  selectUniqueActiveDataQualities,
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

export const useAllActiveDataQualities = (column: DataColumn<'quality'>) =>
  useAppSelector((state) => selectAllActiveDataQualities(state, column))

export const useUniqueActiveDataQualities = (column: DataColumn<'quality'>) =>
  useAppSelector((state) => selectUniqueActiveDataQualities(state, column))

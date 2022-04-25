import { useAppDispatch, useAppSelector } from '../store'
import {
  selectActiveData,
  selectActiveDataColumns,
  selectActiveEntity,
  selectAllActiveDataQualities,
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
} from './selectors'
import { setHoveredEntity, setSelectedEntity } from './dataSlice'
import { EntityId } from './entities'
import { DataColumn } from './columns'

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
  readonly selectedEntity: EntityId
  readonly hoveredEntity: EntityId
  readonly onEntityClick: (id: EntityId) => void
  readonly onEntityHover: (id: EntityId) => void
}

export const useEntityInteraction = (): EntityInteraction => {
  const selectedEntity = useActiveSelectedEntity()
  const hoveredEntity = useActiveHoveredEntity()

  const dispatch = useAppDispatch()

  const onEntityClick = (id: EntityId) => {
    dispatch(setSelectedEntity(id))
  }

  const onEntityHover = (id: EntityId) => {
    dispatch(setHoveredEntity(id))
  }

  return {
    selectedEntity,
    hoveredEntity,
    onEntityClick,
    onEntityHover,
  }
}

export const useCurrentColorColumnNumberRange = () => useAppSelector(selectCurrentColorColumnNumberRange)

export const useAllActiveDataQualities = (column: DataColumn<'quality'>) =>
  useAppSelector((state) => selectAllActiveDataQualities(state, column))

export const useUniqueActiveDataQualities = (column: DataColumn<'quality'>) =>
  Array.from(new Set(useAppSelector((state) => selectAllActiveDataQualities(state, column))))

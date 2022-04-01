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
} from './selectors'
import { setHoveredEntity, setSelectedEntity } from './dataSlice'
import { EntityId } from './entities'

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

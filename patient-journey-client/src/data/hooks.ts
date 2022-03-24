import { useAppDispatch, useAppSelector } from '../store'
import {
  selectDataView,
  selectSelectedActiveEntity,
  selectHoveredActiveEntity,
  selectFilteredActiveData,
  selectActiveDataColumns,
  selectActiveData,
  selectAllFilters,
} from './selectors'
import { setHoveredEntity, setSelectedEntity } from './dataSlice'
import { useCallback } from 'react'
import { EntityId, EntityIdNone } from './entities'

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

  const onEntityClick = useCallback(
    (id: EntityId) => {
      dispatch(setSelectedEntity(selectedEntity === id ? EntityIdNone : id))
    },
    [selectedEntity, dispatch]
  )

  const onEntityHover = useCallback(
    (id: EntityId) => {
      dispatch(setHoveredEntity(id))
    },
    [dispatch]
  )

  return {
    selectedEntity,
    hoveredEntity,
    onEntityClick,
    onEntityHover,
  }
}

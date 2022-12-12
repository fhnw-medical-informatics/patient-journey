import { useAppDispatch, useAppSelector } from '../store'
import {
  selectActiveData,
  selectDataByEntityIdMap,
  selectActiveDataColumns,
  selectActiveHoveredEventEntity,
  selectActiveSelectedEntity,
  selectActiveSelectedEventEntity,
  selectAllFilters,
  selectCurrentColorColumnNumberRange,
  selectDataLoadingErrorMessage,
  selectDataLoadingState,
  selectDataView,
  selectEventDataColumns,
  selectEventDataEidColumn,
  selectEventDataPidColumn,
  selectEventDataPidValues,
  selectEventDataTimestampColumn,
  selectEventDataTimestampValuesFormatted,
  selectFilteredActiveData,
  selectFocusEntity,
  selectHoveredEntity,
  selectPatientDataColumns,
  selectPatientDataPidColumn,
  selectSelectedEntity,
  selectEventFilters,
  selectIndexPatientId,
  selectDataLoadingProgress,
  selectSplitPaneResizing,
  selectSimilarityDataLoadingState,
  selectSimilarityDataLoadingErrorMessage,
  selectIndexPatientIdIndex,
  selectPatientCount,
  selectPatientDataRowMap,
  selectIndexPatientEvents,
} from './selectors'
import { FocusEntity, setHoveredEntity, setSelectedEntity } from './dataSlice'
import { EntityId, EntityType } from './entities'
import { useCallback } from 'react'

export const useDataLoadingState = () => useAppSelector(selectDataLoadingState)
export const useDataLoadingProgress = () => useAppSelector(selectDataLoadingProgress)
export const useDataLoadingErrorMessage = () => useAppSelector(selectDataLoadingErrorMessage)

export const useActiveDataView = () => useAppSelector(selectDataView)

export const useActiveData = () => useAppSelector(selectActiveData)
export const useDataByEntityIdMap = (type: FocusEntity['type']) =>
  useAppSelector((state) => selectDataByEntityIdMap(state, type))
export const useFilteredActiveData = () => useAppSelector(selectFilteredActiveData)

export const useActiveDataColumns = () => useAppSelector(selectActiveDataColumns)

export const useEventDataColumns = () => useAppSelector(selectEventDataColumns)
export const usePatientDataColumns = () => useAppSelector(selectPatientDataColumns)

export const useAllFilters = () => useAppSelector(selectAllFilters)
export const useEventFilters = () => useAppSelector(selectEventFilters)

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
  const type = activeView === 'patients' ? 'patients' : 'events'
  return useEntityInteraction(type)
}

export const useEntityInteraction = (type: EntityType): EntityInteraction => {
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

export const useIndexPatientId = () => useAppSelector(selectIndexPatientId)
export const useIndexPatientEvents = () => useAppSelector(selectIndexPatientEvents)
export const useSimilarityDataLoadingState = () => useAppSelector(selectSimilarityDataLoadingState)
export const useSimilarityDataLoadingErrorMessage = () => useAppSelector(selectSimilarityDataLoadingErrorMessage)
export const useIndexPatientIdIndex = () => useAppSelector(selectIndexPatientIdIndex)

export const usePatientCount = () => useAppSelector(selectPatientCount)

export const useSplitPlaneResizing = () => useAppSelector(selectSplitPaneResizing)

export const usePatientDataRowAsMap = () => useAppSelector(selectPatientDataRowMap)

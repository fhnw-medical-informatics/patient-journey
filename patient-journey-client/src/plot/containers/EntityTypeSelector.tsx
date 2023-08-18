import { useCallback } from 'react'

import { useAppDispatch } from '../../store'

import { setScatterPlotEntityType } from '../plotSlice'

import { useActiveScatterPlotEntityType } from '../hooks'

import { EntityTypeSelector as EntityTypeSelectorComponent } from '../components/EntityTypeSelector'

import { EntityType } from '../../data/entities'

export const EntityTypeSelector = () => {
  const activeEntityType = useActiveScatterPlotEntityType()

  const dispatch = useAppDispatch()

  const onChange = useCallback(
    (entityType: EntityType) => {
      dispatch(setScatterPlotEntityType(entityType))
    },
    [dispatch]
  )

  return <EntityTypeSelectorComponent label="Entity Type" activeEntityType={activeEntityType} onChange={onChange} />
}

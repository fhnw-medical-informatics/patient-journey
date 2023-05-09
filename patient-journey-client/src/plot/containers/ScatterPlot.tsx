import { ScatterPlot as ScatterPlotComponent } from '../components/ScatterPlot'
import { useScatterPlotData } from '../hooks'
import { useCallback } from 'react'
import { useEntityInteraction, useHoveredEntity, useIndexPatientId, useSelectedEntity } from '../../data/hooks'

export const ScatterPlot = () => {
  const data = useScatterPlotData()
  const hoveredEntity = useHoveredEntity()
  const selectedEntity = useSelectedEntity()
  const indexPatientId = useIndexPatientId()

  const { onEntityHover, onEntityClick } = useEntityInteraction('patients')

  const onPlotClick = useCallback(() => onEntityClick(hoveredEntity.uid), [hoveredEntity, onEntityClick])

  return (
    <ScatterPlotComponent
      {...data}
      hoveredEntity={hoveredEntity.uid}
      selectedEntity={selectedEntity.uid}
      indexPatientId={indexPatientId}
      onEntityHover={onEntityHover}
      onPlotClick={onPlotClick}
    />
  )
}

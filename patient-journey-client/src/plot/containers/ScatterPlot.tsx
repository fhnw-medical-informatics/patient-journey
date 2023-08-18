import { ScatterPlot as ScatterPlotComponent } from '../components/ScatterPlot'
import { useActiveScatterPlotXAxisColumn, useActiveScatterPlotYAxisColumn, useScatterPlotData } from '../hooks'
import { useCallback } from 'react'
import { useEntityInteraction, useHoveredEntity, useIndexPatientId, useSelectedEntity } from '../../data/hooks'

export const ScatterPlot = () => {
  const data = useScatterPlotData()
  const xAxisColumn = useActiveScatterPlotXAxisColumn()
  const yAxisColumn = useActiveScatterPlotYAxisColumn()
  const hoveredEntity = useHoveredEntity()
  const selectedEntity = useSelectedEntity()
  const indexPatientId = useIndexPatientId()

  const { onEntityHover, onEntityClick } = useEntityInteraction('patients')

  const onPlotClick = useCallback(() => onEntityClick(hoveredEntity.uid), [hoveredEntity, onEntityClick])

  return (
    <ScatterPlotComponent
      {...data}
      xAxisColumn={xAxisColumn}
      yAxisColumn={yAxisColumn}
      hoveredEntity={hoveredEntity.uid}
      selectedEntity={selectedEntity.uid}
      indexPatientId={indexPatientId}
      onEntityHover={onEntityHover}
      onPlotClick={onPlotClick}
    />
  )
}

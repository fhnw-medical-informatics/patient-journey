import React, { useCallback, useMemo } from 'react'
import { alpha, Grid, Paper } from '@mui/material'
import { ScatterPlotData, ScatterPlotDatum } from '../model'
import { ScatterPlotCanvas, ScatterPlotCustomCanvasLayer } from '@nivo/scatterplot'
import AutoSizer, { Size } from 'react-virtualized-auto-sizer'
import { createFocusColor, useCustomTheme } from '../../theme/useCustomTheme'
import { AxisColumnSelector } from '../containers/AxisColumnSelector'
import { ColorByColumnSelector } from '../../color/containers/ColorByColumnSelector'
import { ScatterPlotLayerProps, ScatterPlotNodeData } from '@nivo/scatterplot/dist/types/types'
import { ScaleSpec } from '@nivo/scales/dist/types/types'
import { useColor } from '../../color/hooks'
import { useDataByEntityIdMap } from '../../data/hooks'
import { EntityId, EntityIdNone, EntityType } from '../../data/entities'
import { PatientId } from '../../data/patients'
import { changeCanvasFillStyle } from '../../utils'
import { EntityTypeSelector } from '../containers/EntityTypeSelector'
import { ScatterPlotAxisColumn, PlotColumnNone } from '../plotSlice'

const ACTIVE_NODE_SCALE_FACTOR = 1.2

const sxRoot = {
  width: 1,
  height: 1,
  paddingBottom: '20px',
  display: 'grid',
  gridTemplateRows: 'auto 1fr',
}

const sxToolbar = {
  p: 2,
  lineHeight: 1,
}

interface Props extends ScatterPlotData {
  readonly entityType: EntityType
  readonly xAxisColumn: ScatterPlotAxisColumn
  readonly yAxisColumn: ScatterPlotAxisColumn
  readonly hoveredEntity: EntityId
  readonly selectedEntity: EntityId
  readonly indexPatientId: PatientId
  readonly onEntityHover: (id: EntityId) => void
  readonly onPlotClick: () => void
}

export const ScatterPlot = ({
  entityType,
  xAxisLabel,
  yAxisLabel,
  data,
  xAxisColumn,
  yAxisColumn,
  hoveredEntity,
  selectedEntity,
  indexPatientId,
  onEntityHover,
  onPlotClick,
}: Props) => {
  const theme = useCustomTheme()
  const entityById = useDataByEntityIdMap(entityType)
  const { colorByColumnFn } = useColor(entityType)
  const selectedColor = createFocusColor(theme, theme.entityColors.selected)
  const hoveredColor = createFocusColor(theme, theme.entityColors.default)
  const indexPatientColor = theme.entityColors.indexPatient
  const backgroundColor = theme.palette.background.paper

  const renderCircle = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, entityId: EntityId, strokeStyle: string) => {
      ctx.beginPath()
      ctx.arc(x, y, size, 0, 2 * Math.PI)
      changeCanvasFillStyle(ctx, colorByColumnFn(entityById.get(entityId)!))
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = strokeStyle
      ctx.stroke()
    },
    [entityById, colorByColumnFn]
  )

  const renderNode = useCallback(
    (ctx: CanvasRenderingContext2D, node: ScatterPlotNodeData<ScatterPlotDatum>) => {
      renderCircle(ctx, node.x, node.y, node.size / 2, node.data.entityId, backgroundColor)
    },
    [renderCircle, backgroundColor]
  )

  const renderActiveNode = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      { xScale, yScale }: ScatterPlotLayerProps<ScatterPlotDatum>,
      node: ScatterPlotNodeData<ScatterPlotDatum>,
      activeColor: string
    ) => {
      ctx.moveTo(xScale(node.x), yScale(node.y))
      renderCircle(ctx, node.x, node.y, (ACTIVE_NODE_SCALE_FACTOR * node.size) / 2, node.data.entityId, activeColor)
    },
    [renderCircle]
  )

  // custom layer to always render highlighted nodes on top of everything else
  const activeMarksLayer: ScatterPlotCustomCanvasLayer<ScatterPlotDatum> = useCallback(
    (ctx, props) => {
      const { nodes } = props

      const hoveredNode = nodes.find((n) => n.data.entityId === hoveredEntity)
      if (hoveredNode) {
        renderActiveNode(ctx, props, hoveredNode, hoveredColor)
      }

      const selectedNode = nodes.find((n) => n.data.entityId === selectedEntity)
      if (selectedNode) {
        renderActiveNode(ctx, props, selectedNode, selectedColor)
      }

      const indexNode = nodes.find((n) => n.data.entityId === indexPatientId)
      if (indexNode) {
        renderActiveNode(ctx, props, indexNode, indexPatientColor)
      }
    },
    [hoveredEntity, selectedEntity, renderActiveNode, hoveredColor, selectedColor, indexPatientId, indexPatientColor]
  )

  const getScaleConfig = useCallback((column: ScatterPlotAxisColumn): ScaleSpec => {
    if (column === PlotColumnNone) {
      return { type: 'linear', min: 'auto', max: 'auto' }
    } else {
      switch (column.type) {
        case 'pid':
        case 'eid':
        case 'boolean':
        case 'category':
        case 'string':
          return { type: 'point' }
        case 'number':
          return { type: 'linear', min: 'auto', max: 'auto' }
        case 'date':
        case 'timestamp':
          return { type: 'time', format: 'native', min: 'auto', max: 'auto', precision: 'millisecond' }
        default:
          return { type: 'linear', min: 'auto', max: 'auto' }
      }
    }
  }, [])

  const xScaleConfig = useMemo(() => getScaleConfig(xAxisColumn), [getScaleConfig, xAxisColumn])
  const yScaleConfig = useMemo(() => getScaleConfig(yAxisColumn), [getScaleConfig, yAxisColumn])

  return (
    <Paper sx={sxRoot} variant="outlined">
      <Grid sx={sxToolbar} container alignItems={'flex-end'} spacing={1}>
        <EntityTypeSelector />
        <AxisColumnSelector axis={'x'} />
        <AxisColumnSelector axis={'y'} />
        <ColorByColumnSelector />
      </Grid>
      <div>
        <AutoSizer>
          {({ width, height }: Size) => {
            return (
              <ScatterPlotCanvas
                width={width}
                height={height}
                data={data}
                renderNode={renderNode}
                xScale={xScaleConfig}
                axisLeft={{ legend: yAxisLabel, legendPosition: 'middle', legendOffset: -50 }}
                axisBottom={{ legend: xAxisLabel, legendPosition: 'middle', legendOffset: 40 }}
                yScale={yScaleConfig}
                margin={{ top: 10, right: 20, bottom: 50, left: 70 }}
                theme={{
                  textColor: theme.palette.text.primary,
                  axis: { legend: { text: { fontWeight: 'bold' } } },
                  grid: { line: { stroke: alpha(theme.palette.text.disabled, 0.2) } },
                }}
                layers={['grid', 'axes', 'nodes', 'mesh', 'legends', 'annotations', activeMarksLayer]}
                onMouseMove={(node) => onEntityHover(node.data.entityId)}
                onMouseLeave={(_) => onEntityHover(EntityIdNone)}
                onClick={onPlotClick}
                tooltip={(_) => null} // using info panel instead
              />
            )
          }}
        </AutoSizer>
      </div>
    </Paper>
  )
}

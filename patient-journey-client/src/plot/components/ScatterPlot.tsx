import { alpha, Box, Paper } from '@mui/material'
import { ScatterPlotData, ScatterPlotDatum } from '../model'
import { ScatterPlotCanvas } from '@nivo/scatterplot'
import AutoSizer, { Size } from 'react-virtualized-auto-sizer'
import React, { useCallback } from 'react'
import { useCustomTheme } from '../../theme/useCustomTheme'
import { AxisColumnSelector } from '../containers/AxisColumnSelector'
import { ColorByColumnSelector } from '../../color/containers/ColorByColumnSelector'
import { ScatterPlotNodeData } from '@nivo/scatterplot/dist/types/types'
import { useColor } from '../../color/hooks'
import { useDataByEntityIdMap } from '../../data/hooks'

const sxRoot = {
  width: 1,
  height: 1,
  paddingBottom: '20px',
  display: 'grid',
  gridTemplateRows: 'auto 1fr',
}

const sxSelectors = {
  display: 'grid',
  gridTemplateColumns: '25% 25% 25%',
  gap: 1,
  margin: 1,
}

type Props = ScatterPlotData

export const ScatterPlot = ({ xAxisLabel, yAxisLabel, data }: Props) => {
  const theme = useCustomTheme()
  const entityById = useDataByEntityIdMap('patients')
  const { colorByColumnFn } = useColor('patients')

  const renderNode = useCallback(
    (ctx: CanvasRenderingContext2D, node: ScatterPlotNodeData<ScatterPlotDatum>) => {
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.size / 2, 0, 2 * Math.PI)
      ctx.fillStyle = colorByColumnFn(entityById.get(node.data.patientId)!)
      ctx.fill()
    },
    [entityById, colorByColumnFn]
  )

  return (
    <Paper sx={sxRoot} variant="outlined">
      <Box sx={sxSelectors}>
        <AxisColumnSelector axis={'x'} />
        <AxisColumnSelector axis={'y'} />
        <ColorByColumnSelector includeEventColumns={false} />
      </Box>
      <div>
        <AutoSizer>
          {({ width, height }: Size) => {
            return (
              <ScatterPlotCanvas
                width={width}
                height={height}
                data={data}
                renderNode={renderNode}
                xScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                axisLeft={{ legend: xAxisLabel, legendPosition: 'middle', legendOffset: -50 }}
                axisBottom={{ legend: yAxisLabel, legendPosition: 'middle', legendOffset: 40 }}
                yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                margin={{ top: 10, right: 20, bottom: 50, left: 70 }}
                theme={{
                  textColor: theme.palette.text.primary,
                  axis: { legend: { text: { fontWeight: 'bold' } } },
                  grid: { line: { stroke: alpha(theme.palette.text.disabled, 0.2) } },
                }}
              />
            )
          }}
        </AutoSizer>
      </div>
    </Paper>
  )
}

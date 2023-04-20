import { alpha, Paper } from '@mui/material'
import { ScatterPlotDatum } from '../model'
import { ScatterPlotCanvas } from '@nivo/scatterplot'
import AutoSizer, { Size } from 'react-virtualized-auto-sizer'
import React from 'react'
import { useCustomTheme } from '../../theme/useCustomTheme'

const sxRoot = {
  width: 1,
  height: 1,
  paddingBottom: '20px',
  display: 'grid',
}

interface Props {
  readonly xAxisLabel: string
  readonly yAxisLabel: string
  readonly data: ScatterPlotDatum[]
}

export const ScatterPlot = ({ xAxisLabel, yAxisLabel, data }: Props) => {
  const theme = useCustomTheme()

  return (
    <Paper sx={sxRoot} variant="outlined">
      <AutoSizer>
        {({ width, height }: Size) => {
          return (
            <ScatterPlotCanvas
              width={width}
              height={height}
              data={[{ id: 'default', data }]}
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
    </Paper>
  )
}

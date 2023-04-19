import { Paper } from '@mui/material'
import { ScatterPlotDatum } from '../model'
import { ScatterPlotCanvas } from '@nivo/scatterplot'
import AutoSizer, { Size } from 'react-virtualized-auto-sizer'
import React from 'react'
import { extent } from 'd3-array'

const sxRoot = {
  width: 1,
  height: 1,
  paddingBottom: '20px',
  display: 'grid',
}

interface Props {
  readonly data: ScatterPlotDatum[]
}

export const ScatterPlot = ({ data }: Props) => {
  const [xMin, xMax] = extent(data.map((d) => d.x))
  const [yMin, yMax] = extent(data.map((d) => d.y))!

  return (
    <Paper sx={sxRoot} variant="outlined">
      <AutoSizer>
        {({ width, height }: Size) => (
          <ScatterPlotCanvas
            width={width}
            height={height}
            data={[{ id: 'default', data }]}
            xScale={{ type: 'linear', min: xMin, max: xMax }}
            yScale={{ type: 'linear', min: yMin, max: yMax }}
          />
        )}
      </AutoSizer>
    </Paper>
  )
}

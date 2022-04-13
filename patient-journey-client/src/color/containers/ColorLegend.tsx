import React from 'react'
import { Coloring, useColor } from '../useColor'
import { ColorLegendGradient } from '../components/ColorLegendGradient'
import { useCurrentColorColumnNumberRange } from '../../data/hooks'
import { ColorLegend as ColorLegendComponent } from '../components/ColorLegend'
import { ColorByColumnNone } from '../colorSlice'
import { NoColoringLabel } from '../components/NoColoringLabel'

export const ColorLegend = () => {
  const coloring = useColor()
  const isActive = coloring.colorByColumn !== ColorByColumnNone
  return (
    <ColorLegendComponent isActive={isActive}>
      {isActive ? <ColorLegendContent {...coloring} /> : <NoColoringLabel isActive={false} />}
    </ColorLegendComponent>
  )
}

const ColorLegendContent = ({ colorScale, colorByNumberFn }: Coloring) => {
  const numberRange = useCurrentColorColumnNumberRange()
  if (colorScale === 'linear' && numberRange?.length === 2) {
    const span = numberRange[1] - numberRange[0]
    const start = numberRange[0]
    const colorStopValues = [start, start + 0.25 * span, start + 0.5 * span, start + 0.75 * span, start + span]
    const colorStops = colorStopValues.map(colorByNumberFn)
    return <ColorLegendGradient colorStops={colorStops} />
  } else {
    // TODO: 'categorical' color scale
    return <div>{'Categorical'}</div>
  }
}

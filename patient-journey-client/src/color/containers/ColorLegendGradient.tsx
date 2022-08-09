import { ColorLegendGradient as ColorLegendGradientComponent } from '../components/ColorLegendGradient'
import { useColor } from '../hooks'
import { EventDataColumn } from '../../data/events'
import { PatientDataColumn } from '../../data/patients'

interface Props {
  readonly column: EventDataColumn | PatientDataColumn
  readonly min: number
  readonly max: number
}

export const ColorLegendGradient = ({ column, min, max }: Props) => {
  const { colorByColumn, colorByNumberFn } = useColor()
  if (column === colorByColumn.column) {
    const numberRangeExtent = max - min
    const colorStops = [0, 0.25, 0.5, 0.75, 1].map((v) => colorByNumberFn(min + v * numberRangeExtent))
    return <ColorLegendGradientComponent colorStops={colorStops} />
  } else {
    return <div />
  }
}

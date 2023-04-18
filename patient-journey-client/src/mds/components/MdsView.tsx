import { ResponsiveScatterPlot } from '@nivo/scatterplot'
import { MdsPoint } from '../mdsSlice'
import { extent } from 'd3-array'

interface Props {
  readonly points: ReadonlyArray<MdsPoint>
}

export const MdsView = ({ points }: Props) => {
  const [xMin, xMax] = extent(points.map((p) => p.x))
  const [yMin, yMax] = extent(points.map((p) => p.y))

  return (
    <div style={{ width: 1000, height: 300 }}>
      <ResponsiveScatterPlot
        data={[{ id: 'Patients', data: [...points] }]}
        margin={{ top: 60, right: 140, bottom: 70, left: 90 }}
        xScale={{ type: 'linear', min: xMin, max: xMax }}
        yScale={{ type: 'linear', min: yMin, max: yMax }}
      />
    </div>
  )
}

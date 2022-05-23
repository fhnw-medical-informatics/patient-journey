import { scaleBand, scaleLinear } from 'd3-scale'
import { Domain, TimelineLane } from 'react-svg-timeline'

interface TimeScaleProps {
  domain: Domain
  width: number
  height: number
  lanes: ReadonlyArray<TimelineLane<any>>
  timeScalePadding: number
}

export const createTimelineScales = ({ domain, width, height, lanes, timeScalePadding }: TimeScaleProps) => {
  const xScale = scaleLinear()
    .domain(domain)
    .range([timeScalePadding, width - timeScalePadding])

  const yScale = scaleBand()
    .domain(lanes.map((l) => l.laneId))
    .range([0, height])
    .paddingInner(0.3)
    .paddingOuter(0.8)

  return { xScale, yScale }
}

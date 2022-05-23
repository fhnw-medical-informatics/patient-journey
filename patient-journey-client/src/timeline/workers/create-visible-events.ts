import { groups } from 'd3-array'
import { CustomLayerProps, TimelineEvent } from 'react-svg-timeline'
import { createTimelineScales } from './shared'

export type Coordinates = { x: number; y: number }

const createVisibleEventsWorker = () => {
  let previousResult: {
    visibleEventsWithCoordinates: ReadonlyArray<
      Pick<TimelineEvent<any, any>, 'color' | 'startTimeMillis' | 'laneId'> & Coordinates
    >
    pinnedEventsWithCoordinates: ReadonlyArray<
      Pick<TimelineEvent<any, any>, 'color' | 'startTimeMillis' | 'laneId'> & Coordinates
    >
  } = {
    visibleEventsWithCoordinates: [],
    pinnedEventsWithCoordinates: [],
  }

  const computeVisibleEvents = ({
    events,
    domain,
    width,
    height,
    lanes,
    laneDisplayMode,
    isAnimationInProgress,
  }: CustomLayerProps<any, any, TimelineEvent<any, any>>) => {
    const timeScalePadding = 50

    const { xScale, yScale } = createTimelineScales({
      domain,
      width,
      height,
      lanes,
      timeScalePadding,
    })

    const getCoordinates = (e: Pick<TimelineEvent<any, any>, 'color' | 'startTimeMillis' | 'laneId'>): Coordinates => {
      return {
        x: Math.floor(xScale(e.startTimeMillis)),
        y: Math.floor(laneDisplayMode === 'collapsed' ? height / 2 : yScale(e.laneId!)!),
      }
    }

    // TODO: Also do this, when resizing and panning
    if (!isAnimationInProgress) {
      // Process all events when no animation is in progress

      // Get current coordinates for all events
      const eventsWithCoordinates = events.map((e) => ({
        ...e,
        ...getCoordinates(e),
      }))

      // Get current coordinates for all pinned/selected events
      const pinnedEventsWithCoordinates = eventsWithCoordinates.filter((event) => event.isSelected || event.isPinned)

      // Group events by coordinates (events that would be painted on top of each other,
      // share the same coordinates and fall into the same group)
      const eventsGroupedByCoordinates = groups(
        eventsWithCoordinates,
        (e) => e.y,
        (e) => e.x
      )

      // Reduce the events to only visible events (1 event representing each coordinate group)
      const visibleEventsWithCoordinates = eventsGroupedByCoordinates.reduce((accLanes, curLane) => {
        const y = curLane[0]

        const newLanes = []

        for (let i = 0; i < curLane[1].length; i++) {
          const x = curLane[1][i][0]
          const firstEventInGroup = curLane[1][i][1][0]

          newLanes.push({
            x,
            y,
            color: firstEventInGroup.color,
            startTimeMillis: firstEventInGroup.startTimeMillis,
            laneId: firstEventInGroup.laneId,
          })
        }

        return [...accLanes, ...newLanes]
      }, [] as ReadonlyArray<Pick<TimelineEvent<any, any>, 'color' | 'startTimeMillis' | 'laneId'> & Coordinates>)

      return {
        visibleEventsWithCoordinates,
        pinnedEventsWithCoordinates,
      }
    } else {
      // Only update currently visible (previously processed) events when animation is in progress
      return {
        visibleEventsWithCoordinates: previousResult.visibleEventsWithCoordinates.map((e) => ({
          ...e,
          ...getCoordinates(e),
        })),
        pinnedEventsWithCoordinates: previousResult.pinnedEventsWithCoordinates.map((e) => ({
          ...e,
          ...getCoordinates(e),
        })),
      }
    }
  }

  onmessage = (e: MessageEvent<CustomLayerProps<any, any, TimelineEvent<any, any>>>) => {
    console.log('getting message')
    previousResult = computeVisibleEvents(e.data)

    postMessage(previousResult)
  }
}

export default createVisibleEventsWorker()

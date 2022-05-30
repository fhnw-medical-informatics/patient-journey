import { groups } from 'd3-array'
import { TimelineEvent } from 'react-svg-timeline'
import { createTimelineScales } from './shared'

type Coordinates = { x: number; y: number }

type MinimalEvent = Pick<TimelineEvent<any, any>, 'color' | 'startTimeMillis' | 'laneId'>

type EventWithCoordinates = MinimalEvent & Coordinates

interface VisibleEventsResult {
  visibleEventsWithCoordinates: ReadonlyArray<EventWithCoordinates>
  pinnedEventsWithCoordinates: ReadonlyArray<EventWithCoordinates>
}

export type VisibleEventsWorkerData = {
  events: ReadonlyArray<TimelineEvent<any, any>>
  domain: [number, number]
  width: number
  height: number
  lanes: ReadonlyArray<any>
  laneDisplayMode: 'collapsed' | 'expanded' | undefined
  isAnimationInProgress: boolean
}

export type VisibleEventsWorkerResponse = VisibleEventsResult

// TODO: Use this for cluster calc als well.
const createVisibleEventsWorker = () => {
  let previousResult: VisibleEventsWorkerResponse = {
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
  }: VisibleEventsWorkerData): VisibleEventsWorkerResponse => {
    const timeScalePadding = 50

    const { xScale, yScale } = createTimelineScales({
      domain,
      width,
      height,
      lanes,
      timeScalePadding,
    })

    const getCoordinates = (e: MinimalEvent): Coordinates => {
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
      }, [] as ReadonlyArray<EventWithCoordinates>)

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

  onmessage = (e: MessageEvent<VisibleEventsWorkerData>) => {
    previousResult = computeVisibleEvents(e.data)
    postMessage(previousResult)
  }
}

export default createVisibleEventsWorker()

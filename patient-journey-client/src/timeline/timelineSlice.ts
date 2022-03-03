import { createSlice, Draft } from '@reduxjs/toolkit'

export type Events = (
  | {
      eventId: string
      startTimeMillis: number
      laneId: string
      endTimeMillis?: undefined
    }
  | {
      eventId: string
      startTimeMillis: number
      endTimeMillis: number
      laneId: string
    }
)[]

export type Lanes = {
  laneId: string
  label: string
}[]

export type TimelineType = 'timestamp' | 'date of birth'

export type TimelineShirtSize = 'S' | 'M' | 'L'

export type TimelineState = {
  type: TimelineType
  shirtSize: TimelineShirtSize
  cluster: boolean
}

const timelineSlice = createSlice({
  name: 'timeline',
  initialState: { type: 'timestamp', cluster: false } as TimelineState,
  reducers: {
    setTimelineType: (state: Draft<TimelineState>, action) => {
      state.type = action.payload
    },
    setTimelineCluster: (state: Draft<TimelineState>) => {
      state.cluster = !state.cluster
    },
  },
})

export const timelineReducer = timelineSlice.reducer
export const { setTimelineType, setTimelineCluster } = timelineSlice.actions

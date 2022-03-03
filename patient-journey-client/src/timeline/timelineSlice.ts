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
}

const timelineSlice = createSlice({
  name: 'timeline',
  initialState: { type: 'timestamp' } as TimelineState,
  reducers: {
    setTimelineType: (state: Draft<TimelineState>, action) => {
      state.type = action.payload
      console.log('hello')
    },
  },
})

export const timelineReducer = timelineSlice.reducer
export const { setTimelineType } = timelineSlice.actions

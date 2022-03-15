import { createSlice, Draft } from '@reduxjs/toolkit'
import { EventDataColumn } from '../data/events'
import { PatientDataColumn } from '../data/patients'

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

export type TimelineColumn = EventDataColumn | PatientDataColumn

export type TimelineState = {
  column: TimelineColumn
  cluster: boolean
  grouping: boolean
}

const timelineSlice = createSlice({
  name: 'timeline',
  initialState: { cluster: false, grouping: false } as TimelineState,
  reducers: {
    setTimelineColumn: (state: Draft<TimelineState>, action) => {
      state.column = action.payload
    },
    setTimelineCluster: (state: Draft<TimelineState>) => {
      state.cluster = !state.cluster
    },
    setTimelineGrouping: (state: Draft<TimelineState>) => {
      state.grouping = !state.grouping
    },
  },
})

export const timelineReducer = timelineSlice.reducer
export const { setTimelineColumn, setTimelineCluster, setTimelineGrouping } = timelineSlice.actions

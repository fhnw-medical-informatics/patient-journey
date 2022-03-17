import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit'
import { EventDataColumn } from '../data/events'
import { PatientDataColumn } from '../data/patients'

export type TimelineColumn = EventDataColumn | PatientDataColumn | NoTimelineColumn

export const TimelineColumnNone = 'None'
type NoTimelineColumn = typeof TimelineColumnNone

export type TimelineState = {
  column: TimelineColumn
  cluster: boolean
  grouping: boolean
}

const timelineSlice = createSlice({
  name: 'timeline',
  initialState: { cluster: true, grouping: true, column: TimelineColumnNone } as TimelineState,
  reducers: {
    setTimelineColumn: (state: Draft<TimelineState>, action: PayloadAction<TimelineColumn>) => {
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

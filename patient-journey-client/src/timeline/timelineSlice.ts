import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit'
import { EventDataColumn } from '../data/events'
import { PatientDataColumn } from '../data/patients'

export type TimelineColumn = EventDataColumn | PatientDataColumn | NoTimelineColumn

export const TimelineColumnNone = 'None'
type NoTimelineColumn = typeof TimelineColumnNone

export type TimelineState = {
  viewByColumn: TimelineColumn
  expandByColumn: TimelineColumn
  cluster: boolean
}

export const initialTimelineState: TimelineState = {
  cluster: true,
  viewByColumn: TimelineColumnNone,
  expandByColumn: TimelineColumnNone,
}

const timelineSlice = createSlice({
  name: 'timeline',
  initialState: initialTimelineState,
  reducers: {
    setViewByColumn: (state: Draft<TimelineState>, action: PayloadAction<TimelineColumn>) => {
      state.viewByColumn = action.payload
    },
    setExpandByColumn: (state: Draft<TimelineState>, action: PayloadAction<TimelineColumn>) => {
      state.expandByColumn = action.payload
    },
    setTimelineCluster: (state: Draft<TimelineState>) => {
      state.cluster = !state.cluster
    },
  },
})

export const timelineReducer = timelineSlice.reducer
export const { setViewByColumn, setExpandByColumn, setTimelineCluster } = timelineSlice.actions

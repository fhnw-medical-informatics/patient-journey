import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit'
import { EventDataColumn } from '../data/events'
import { PatientDataColumn } from '../data/patients'

export type TimelineColumn = EventDataColumn | PatientDataColumn | NoTimelineColumn

export const TimelineColumnNone = 'None'
type NoTimelineColumn = typeof TimelineColumnNone

export const CursorPositionNone = { x: NaN, y: NaN }
type NoCursorPosition = typeof CursorPositionNone

export type CursorPosition = { x: number; y: number } | NoCursorPosition

export type TimelineState = {
  viewByColumn: TimelineColumn
  expandByColumn: TimelineColumn
  sortByColumn: TimelineColumn
  cluster: boolean
  showFilteredOut: boolean
  showTimeGrid: boolean
  allowInteraction: boolean
  cursorPosition: CursorPosition
}

export const initialTimelineState: TimelineState = {
  cluster: true,
  showFilteredOut: false,
  showTimeGrid: true,
  allowInteraction: false,
  viewByColumn: TimelineColumnNone,
  expandByColumn: TimelineColumnNone,
  sortByColumn: TimelineColumnNone,
  cursorPosition: CursorPositionNone,
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
      state.sortByColumn = TimelineColumnNone
    },
    setSortByColumn: (state: Draft<TimelineState>, action: PayloadAction<TimelineColumn>) => {
      if (state.expandByColumn !== TimelineColumnNone) {
        state.sortByColumn = action.payload
      }
    },
    setTimelineCluster: (state: Draft<TimelineState>) => {
      state.cluster = !state.cluster
    },
    setShowFilteredOut: (state: Draft<TimelineState>) => {
      state.showFilteredOut = !state.showFilteredOut
    },
    setCursorPosition: (state: Draft<TimelineState>, action: PayloadAction<CursorPosition>) => {
      state.cursorPosition = action.payload
    },
    resetCursorPosition: (state: Draft<TimelineState>) => {
      state.cursorPosition = CursorPositionNone
    },
    toggleTimeGrid: (state: Draft<TimelineState>) => {
      state.showTimeGrid = !state.showTimeGrid
    },
    toggleAllowInteraction: (state: Draft<TimelineState>) => {
      state.allowInteraction = !state.allowInteraction
    },
  },
})

export const timelineReducer = timelineSlice.reducer
export const {
  setViewByColumn,
  setExpandByColumn,
  setSortByColumn,
  setShowFilteredOut,
  setTimelineCluster,
  setCursorPosition,
  resetCursorPosition,
  toggleTimeGrid,
  toggleAllowInteraction,
} = timelineSlice.actions

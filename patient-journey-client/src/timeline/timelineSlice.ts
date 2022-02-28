import { createSlice } from '@reduxjs/toolkit'

export interface TimelineEvents {
  readonly eventId: string
  readonly startTimeMillis: number
  readonly laneId: string
  readonly endTimeMillis?: number
}

type TimelineViewDateOfBirth = Readonly<{
  type: 'date of birth'
}>

type TimelineViewTimestamp = Readonly<{
  type: 'timestamp'
}>

export type TimelineView = TimelineViewDateOfBirth | TimelineViewTimestamp

const timelineSlice = createSlice({
  name: 'data',
  initialState: { type: 'date of birth' } as TimelineView,
  reducers: {
    ViewDateOfBirth: (): TimelineView => ({
      type: 'date of birth',
    }),
    ViewTimestamp: (): TimelineView => ({
      type: 'timestamp',
    }),
  },
})

export const timelineReducer = timelineSlice.reducer
export const { ViewDateOfBirth, ViewTimestamp } = timelineSlice.actions

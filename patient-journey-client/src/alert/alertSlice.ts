import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit'

export interface Alert {
  readonly topic: string
  readonly message: string
}

export interface AlertState {
  readonly alerts: ReadonlyArray<Alert>
  readonly unreadCount: number
}

const initialState: AlertState = {
  alerts: [],
  unreadCount: 0,
}

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    addAlerts: (state: Draft<AlertState>, action: PayloadAction<ReadonlyArray<Alert>>) => {
      state.unreadCount += action.payload.length
      state.alerts = state.alerts.concat(action.payload)
    },
    markAlertsRead: (state: Draft<AlertState>) => {
      state.unreadCount = 0
    },
  },
})

export const alertReducer = alertSlice.reducer
export const { addAlerts, markAlertsRead } = alertSlice.actions

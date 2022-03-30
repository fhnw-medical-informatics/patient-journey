import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'

// Importing reducers from slice rather than including them in each index
// prevents circular dependencies (mainly because index also contains container
// components, which in turn import `useAppDispatch`/`useAppSelector`)

import { dataReducer } from '../data/dataSlice'
import { themeReducer } from '../theme/themeSlice'
import { timelineReducer } from '../timeline/timelineSlice'
import { colorReducer } from '../color/colorSlice'
import { alertReducer } from '../alert/alertSlice'

export const reducer = combineReducers({
  theme: themeReducer,
  data: dataReducer,
  timeline: timelineReducer,
  color: colorReducer,
  alert: alertReducer,
})

export type RootState = ReturnType<typeof reducer>

export const createStore = () =>
  configureStore({
    reducer,
  })

export const store = createStore()

export const useAppDispatch = () => useDispatch<typeof store.dispatch>()
export const useAppSelector = <T>(selector: (state: RootState) => T): T => useSelector<RootState, T>(selector)

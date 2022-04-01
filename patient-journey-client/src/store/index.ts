import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
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

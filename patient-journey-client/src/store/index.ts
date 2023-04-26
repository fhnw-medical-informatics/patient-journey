import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import { dataReducer } from '../data/dataSlice'
import { themeReducer } from '../theme/themeSlice'
import { timelineReducer } from '../timeline/timelineSlice'
import { colorReducer } from '../color/colorSlice'
import { alertReducer } from '../alert/alertSlice'
import { tableReducer } from '../table/tableSlice'

import { listenerMiddleware } from '../data/similarityPromptMiddleware'

export const reducer = combineReducers({
  theme: themeReducer,
  data: dataReducer,
  table: tableReducer,
  timeline: timelineReducer,
  color: colorReducer,
  alert: alertReducer,
})

export type RootState = ReturnType<typeof reducer>

export const createStore = () =>
  configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // https://redux-toolkit.js.org/api/getDefaultMiddleware
        serializableCheck: import.meta.env.VITE_APP_REDUX_TOOLKIT_DEVCHECKS === 'true',
        immutableCheck: import.meta.env.VITE_APP_REDUX_TOOLKIT_DEVCHECKS === 'true',
      }).prepend(listenerMiddleware.middleware),
  })

export const store = createStore()

export const useAppDispatch = () => useDispatch<typeof store.dispatch>()
export const useAppSelector = <T>(selector: (state: RootState) => T): T => useSelector<RootState, T>(selector)

import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit'
import { FilterColumn } from '../data/filtering'

export type ColorByColumnOption = typeof ColorByColumnNone | FilterColumn
export const ColorByColumnNone = 'off'

export interface ColorByColumn {
  colorByColumn: ColorByColumnOption
}

export type ColorState = ColorByColumn

const initialState: ColorState = {
  colorByColumn: ColorByColumnNone,
}

const colorSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setColorByColumn: (state: Draft<ColorState>, action: PayloadAction<ColorByColumn>): ColorState => ({
      ...state,
      colorByColumn: action.payload.colorByColumn,
    }),
  },
})

export const colorReducer = colorSlice.reducer
export const { setColorByColumn } = colorSlice.actions

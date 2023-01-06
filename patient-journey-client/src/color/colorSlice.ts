import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit'
import { EntityType } from '../data/entities'
import { FilterColumn } from '../data/filtering'

export const ColorByColumnOptionNone = 'off'
export type ColorByColumnOption = typeof ColorByColumnOptionNone | FilterColumn

const ColorByColumnTypeNone = 'none'

export interface ColorByColumn {
  readonly type: EntityType | typeof ColorByColumnTypeNone
  readonly column: ColorByColumnOption
}

export const ColorByColumnNone: ColorByColumn = { type: 'none', column: ColorByColumnOptionNone }

export type ColorState = ColorByColumn

const initialState: ColorState = ColorByColumnNone

const colorSlice = createSlice({
  name: 'color',
  initialState,
  reducers: {
    setColorByColumn: (state: Draft<ColorState>, action: PayloadAction<ColorByColumn>): ColorState => ({
      ...state,
      column: action.payload.column,
      type: action.payload.type,
    }),
  },
})

export const colorReducer = colorSlice.reducer
export const { setColorByColumn } = colorSlice.actions

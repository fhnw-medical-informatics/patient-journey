import { RootState } from '../store'

import { ColorByColumnOption } from './colorSlice'

export const selectColorByColumn = (s: RootState): ColorByColumnOption => s.color.colorByColumn

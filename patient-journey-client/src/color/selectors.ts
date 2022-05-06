import { RootState } from '../store'

import { ColorByColumn } from './colorSlice'

export const selectColorByColumn = (s: RootState): ColorByColumn => s.color

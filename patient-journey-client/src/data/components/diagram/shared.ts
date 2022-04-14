import { Theme } from '@mui/material'
import { grey } from '@mui/material/colors'
import { Entity } from '../../entities'
import { ColorByColumnOption } from '../../../color/colorSlice'
import { ColorByCategoryFn, ColorByNumberFn } from '../../../color/useColor'
import { DataColumn } from '../../columns'

export interface DataDiagramsProps<T> {
  allActiveData: ReadonlyArray<Entity>
  filteredActiveData: ReadonlyArray<Entity>
  column: DataColumn<T>
  colorByColumn: ColorByColumnOption
  colorByNumberFn: ColorByNumberFn
  colorByCategoryFn: ColorByCategoryFn
}

export const greyColor = (theme: Theme) => (theme.palette.mode === 'light' ? grey[200] : grey[800])

export const barColors = (theme: Theme) => [theme.palette.primary.main, greyColor(theme)]

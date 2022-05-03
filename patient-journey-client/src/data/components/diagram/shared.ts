import { Theme } from '@mui/material'
import { grey } from '@mui/material/colors'
import { Entity } from '../../entities'
import { ColorByColumnOption } from '../../../color/colorSlice'
import { ColorByCategoryFn, ColorByNumberFn } from '../../../color/hooks'
import { DataColumn } from '../../columns'
import { Filter, FilterColumn } from '../../filtering'

export interface DataDiagramsProps<T extends FilterColumn['type']> {
  allActiveData: ReadonlyArray<Entity>
  filteredActiveData: ReadonlyArray<Entity>
  column: DataColumn<T>
  onDataClick: (filter: Filter<T>) => void
  colorByColumn: ColorByColumnOption
  colorByNumberFn: ColorByNumberFn
  colorByCategoryFn: ColorByCategoryFn
}

export const greyColor = (theme: Theme) => (theme.palette.mode === 'light' ? grey[200] : grey[800])

export const barColors = (theme: Theme) => [theme.palette.primary.main, greyColor(theme)]

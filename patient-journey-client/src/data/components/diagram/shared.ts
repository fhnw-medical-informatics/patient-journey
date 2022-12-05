import { Theme } from '@mui/material'
import { Entity } from '../../entities'
import { ColorByColumn } from '../../../color/colorSlice'
import { ColorByCategoryFn, ColorByNumberFn } from '../../../color/hooks'
import { DataColumn } from '../../columns'
import { Filter, FilterColumn } from '../../filtering'

export interface DataDiagramsProps<T extends FilterColumn['type']> {
  allActiveData: ReadonlyArray<Entity>
  filteredActiveData: ReadonlyArray<Entity>
  column: DataColumn<T>
  onDataClick: (filter: Filter<T>) => void
  colorByColumn: ColorByColumn
  colorByNumberFn: ColorByNumberFn
  colorByCategoryFn: ColorByCategoryFn
}

export const greyColor = (theme: Theme) => theme.entityColors.filteredOut

export const barColors = (theme: Theme) => [theme.palette.primary.main, greyColor(theme)]

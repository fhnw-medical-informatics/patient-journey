import { Theme } from '@mui/material'
import { grey } from '@mui/material/colors'
import { Entity } from '../../entities'
import { FilterColumn } from '../../filtering'
import { ColorByColumnOption } from '../../../color/colorSlice'
import { ColorByNumberFn, ColorByQualityFn } from '../../../color/useColor'

export interface DataDiagramsProps {
  allActiveData: ReadonlyArray<Entity>
  filteredActiveData: ReadonlyArray<Entity>
  column: FilterColumn
  colorByColumn: ColorByColumnOption
  colorByNumberFn: ColorByNumberFn
  colorByQualityFn: ColorByQualityFn
}

export const greyColor = (theme: Theme) => (theme.palette.mode === 'light' ? grey[200] : grey[800])

export const barColors = (theme: Theme) => [theme.palette.primary.main, greyColor(theme)]

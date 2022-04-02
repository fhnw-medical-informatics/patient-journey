import { Theme } from '@mui/material'
import { grey } from '@mui/material/colors'
import { Entity } from '../../entities'
import { FilterColumn } from '../../filtering'
import { ColorByColumnOption } from '../../../color/colorSlice'
import { ColorByNumberFn } from '../../../color/useColor'

export interface DataDiagramsProps {
  allActiveData: ReadonlyArray<Entity>
  filteredActiveData: ReadonlyArray<Entity>
  column: FilterColumn
  colorByColumn: ColorByColumnOption
  colorByNumberFn: ColorByNumberFn
}

export const barColors = (theme: Theme) => [
  theme.palette.primary.main,
  theme.palette.mode === 'light' ? grey[200] : grey[800],
]
import { useCallback } from 'react'
import { useTheme } from '@mui/material'
import { scaleOrdinal } from 'd3-scale'
import { interpolatePlasma, schemeSet1, schemeSet2 } from 'd3-scale-chromatic'
import { ColorByColumnNone, ColorByColumnOption } from './colorSlice'
import { useColorByColumn } from './useColorByColumn'
import { FilterColumn } from '../data/filtering'
import { Entity } from '../data/entities'
import { useCurrentColorColumnNumberRange } from '../data/hooks'
import { stringToMillis } from '../data/columns'

export type ColorByColumnFn = (entity?: Entity) => string
export type ColorByCategoryFn = (category?: string) => string
export type ColorByNumberFn = (number?: number) => string
export type ColorScaleType = 'single' | 'categorical' | 'linear'

export type Coloring = Readonly<{
  colorByColumnFn: ColorByColumnFn
  colorByCategoryFn: ColorByCategoryFn
  colorByNumberFn: ColorByNumberFn
  colorByColumn: ColorByColumnOption
  colorScale: ColorScaleType
}>

const lightCategoryFn = scaleOrdinal(schemeSet1)
const darkCategoryFn = scaleOrdinal(schemeSet2)

const lightNumberFn = interpolatePlasma
const darkNumberFn = interpolatePlasma

export const useColor = (): Coloring => {
  const theme = useTheme()
  const numberRange = useCurrentColorColumnNumberRange()
  const colorByColumn: ColorByColumnOption = useColorByColumn()

  const defaultColor = theme.entityColors.default

  const colorScaleCategory = useCallback(
    (category: string) => (theme.palette.mode === 'light' ? lightCategoryFn(category) : darkCategoryFn(category)),
    [theme.palette.mode]
  )

  const colorScaleNumber = useCallback(
    (number: number) => (theme.palette.mode === 'light' ? lightNumberFn(number) : darkNumberFn(number)),
    [theme.palette.mode]
  )

  const getColorByCategory = (category?: string) => (category ? colorScaleCategory(category) : defaultColor)

  const getColorByNumber = (value?: number) =>
    value && numberRange ? colorScaleNumber((value - numberRange[0]) / (numberRange[1] - numberRange[0])) : defaultColor

  const getColorByColumn = (entity?: Entity) => {
    if (!entity || colorByColumn === ColorByColumnNone) {
      return defaultColor
    }

    switch (colorByColumn.type) {
      case 'date':
        return getColorByNumber(stringToMillis(getFieldValue(entity, colorByColumn)))
      case 'timestamp':
      case 'number':
        return getColorByNumber(+getFieldValue(entity, colorByColumn))
      case 'boolean':
      case 'string':
      case 'quality':
        return getColorByCategory(getFieldValue(entity, colorByColumn))
      default:
        return defaultColor
    }
  }

  const colorScale = getColorScale(colorByColumn)

  return {
    colorByColumnFn: (entity?: Entity) => getColorByColumn(entity),
    colorByCategoryFn: getColorByCategory,
    colorByNumberFn: getColorByNumber,
    colorByColumn,
    colorScale,
  }
}

const getColorScale = (column: ColorByColumnOption): ColorScaleType => {
  if (column === ColorByColumnNone) {
    return 'single'
  }
  switch (column.type) {
    case 'date':
    case 'timestamp':
    case 'number':
      return 'linear'
    case 'boolean':
    case 'string':
    case 'quality':
      return 'categorical'
    default:
      return 'single'
  }
}

const getFieldValue = (entity: Entity, column: FilterColumn): string => {
  return entity.values[column.index]
}

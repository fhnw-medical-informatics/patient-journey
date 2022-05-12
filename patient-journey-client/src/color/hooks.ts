import { useCallback } from 'react'
import { useTheme } from '@mui/material'
import { scaleOrdinal } from 'd3-scale'
import { interpolateWarm, interpolateCool, schemeSet2 } from 'd3-scale-chromatic'
import { ColorByColumnOptionNone, ColorByColumn, ColorByColumnNone } from './colorSlice'
import { FilterColumn } from '../data/filtering'
import { Entity, EntityId, EntityIdNone, EntityType } from '../data/entities'
import { useDataByEntityIdMap, useCurrentColorColumnNumberRange } from '../data/hooks'
import { formatColumnValue, stringToMillis } from '../data/columns'
import { useAppSelector } from '../store'
import { selectColorByColumn } from './selectors'
import { FocusEntity } from '../data/dataSlice'

export type ColorByColumnFn = (entity?: Entity) => string
export type ColorByCategoryFn = (category?: string) => string
export type ColorByNumberFn = (number?: number) => string

export interface ColorBy {
  colorByColumnFn: ColorByColumnFn
  colorByCategoryFn: ColorByCategoryFn
  colorByNumberFn: ColorByNumberFn
  colorByColumn: ColorByColumn
}

const lightCategoryFn = scaleOrdinal(schemeSet2)
const darkCategoryFn = scaleOrdinal(schemeSet2)

const lightNumberFn = interpolateWarm
const darkNumberFn = interpolateCool

export const useColor = (type: 'all' | EntityType = 'all'): ColorBy => {
  const theme = useTheme()
  const numberRange = useCurrentColorColumnNumberRange()
  const colorByColumn: ColorByColumn = useColorByColumn()

  const defaultColor = theme.entityColors.default

  const colorScaleCategory = useCallback(
    (category: string) => (theme.palette.mode === 'light' ? lightCategoryFn(category) : darkCategoryFn(category)),
    [theme.palette.mode]
  )

  const colorScaleNumber = useCallback(
    (number: number) => (theme.palette.mode === 'light' ? lightNumberFn(number) : darkNumberFn(number)),
    [theme.palette.mode]
  )

  const colorByCategoryFn = useCallback(
    (category?: string) => (category ? colorScaleCategory(category) : defaultColor),
    [colorScaleCategory, defaultColor]
  )

  const colorByNumberFn = useCallback(
    (value?: number) =>
      value && numberRange
        ? colorScaleNumber((value - numberRange[0]) / (numberRange[1] - numberRange[0]))
        : defaultColor,
    [colorScaleNumber, defaultColor, numberRange]
  )

  const colorByColumnFn = useCallback(
    (entity?: Entity) => {
      if (
        !entity ||
        colorByColumn.type === 'none' ||
        colorByColumn.column === ColorByColumnOptionNone ||
        (type !== 'all' && type !== colorByColumn.type)
      ) {
        return defaultColor
      }

      switch (colorByColumn.column.type) {
        case 'date':
          return colorByNumberFn(stringToMillis(getFieldValue(entity, colorByColumn.column)))
        case 'timestamp':
        case 'number':
          return colorByNumberFn(+getFieldValue(entity, colorByColumn.column))
        case 'boolean':
        case 'string':
        case 'category':
          return colorByCategoryFn(getFieldValue(entity, colorByColumn.column))
        default:
          return defaultColor
      }
    },
    [colorByColumn, defaultColor, colorByCategoryFn, colorByNumberFn, type]
  )

  return { colorByColumnFn, colorByCategoryFn, colorByNumberFn, colorByColumn }
}

const getFieldValue = (entity: Entity, column: FilterColumn): string => {
  return entity.values[column.index]
}

export const useColorByColumn = () => useAppSelector(selectColorByColumn)

export const ColorByInfoNone = 'none'
export type ColorByInfo =
  | typeof ColorByInfoNone
  | Readonly<{
      readonly color: string
      readonly columnName: string
      readonly formattedValue: string
    }>

export const useColorByInfo = (type: FocusEntity['type']) => {
  const dataByEntityId = useDataByEntityIdMap(type)
  const { colorByColumn, colorByColumnFn } = useColor()
  return (uid: EntityId): ColorByInfo => {
    if (
      uid === EntityIdNone ||
      colorByColumn === ColorByColumnNone ||
      colorByColumn.column === ColorByColumnOptionNone ||
      type === 'none' ||
      type !== colorByColumn.type
    ) {
      return 'none'
    } else {
      const data = dataByEntityId.get(uid)!
      const value = data.values[colorByColumn.column.index]
      const formattedValue = formatColumnValue(colorByColumn.type)(value)
      const color = colorByColumnFn(data)
      return {
        color,
        columnName: colorByColumn.column.name,
        formattedValue,
      }
    }
  }
}

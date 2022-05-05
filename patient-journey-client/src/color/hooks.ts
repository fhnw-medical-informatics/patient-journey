import { useCallback } from 'react'
import { useTheme } from '@mui/material'
import { scaleOrdinal } from 'd3-scale'
import { interpolatePlasma, schemeSet1, schemeSet2 } from 'd3-scale-chromatic'
import { ColorByColumnNone, ColorByColumnOption } from './colorSlice'
import { FilterColumn } from '../data/filtering'
import { Entity, EntityId, EntityIdNone } from '../data/entities'
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
  colorByColumn: ColorByColumnOption
}

const lightCategoryFn = scaleOrdinal(schemeSet1)
const darkCategoryFn = scaleOrdinal(schemeSet2)

const lightNumberFn = interpolatePlasma
const darkNumberFn = interpolatePlasma

export const useColor = (): ColorBy => {
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
      if (!entity || colorByColumn === ColorByColumnNone) {
        return defaultColor
      }

      switch (colorByColumn.type) {
        case 'date':
          return colorByNumberFn(stringToMillis(getFieldValue(entity, colorByColumn)))
        case 'timestamp':
        case 'number':
          return colorByNumberFn(+getFieldValue(entity, colorByColumn))
        case 'boolean':
        case 'string':
        case 'category':
          return colorByCategoryFn(getFieldValue(entity, colorByColumn))
        default:
          return defaultColor
      }
    },
    [colorByColumn, defaultColor, colorByCategoryFn, colorByNumberFn]
  )

  return { colorByColumnFn, colorByCategoryFn, colorByNumberFn, colorByColumn }
}

const getFieldValue = (entity: Entity, column: FilterColumn): string => {
  return entity.values[column.index]
}

export const useColorByColumn = () => useAppSelector<ColorByColumnOption>(selectColorByColumn)

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
    if (uid === EntityIdNone || colorByColumn === ColorByColumnNone) {
      return 'none'
    } else {
      const data = dataByEntityId.get(uid)!
      const value = data.values[colorByColumn.index]
      const formattedValue = formatColumnValue(colorByColumn.type)(value)
      const color = colorByColumnFn(data)
      return {
        color,
        columnName: colorByColumn.name,
        formattedValue,
      }
    }
  }
}

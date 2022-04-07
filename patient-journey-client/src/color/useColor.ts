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

export type ColorByFn = [ColorByColumnFn, ColorByCategoryFn, ColorByNumberFn, ColorByColumnOption]

const lightCategoryFn = scaleOrdinal(schemeSet1)
const darkCategoryFn = scaleOrdinal(schemeSet2)

const lightNumberFn = interpolatePlasma
const darkNumberFn = interpolatePlasma

// Inspired by Revizto (see TicketStatusChip)
// export const statusColorScale = (status: Status, theme: Theme) => {
//   switch (status) {
//     case 'Open':
//       return theme.palette.secondary.main
//     case 'In Progress':
//       return theme.palette.warning.main
//     case 'Closed':
//     case 'Resolved':
//       return theme.palette.success.main
//     default:
//       return theme.palette.primary.main
//   }
// }

// Inspired by Revizto (see TicketPriorityChip)
// export const priorityColorScale = (priority: Priority, theme: Theme) => {
//   switch (priority) {
//     case 'None':
//       return theme.palette.success.main
//     case 'Major':
//       return theme.palette.warning.main
//     case 'Critical':
//       return theme.palette.error.main
//     default:
//       return theme.palette.primary.main
//   }
// }

export const useColor = (): ColorByFn => {
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
      // case 'boolean':
      //   return priorityColorScale(getTicketFieldValue(colorByField, ticket) as Priority, theme)
      // case 'status':
      //   return statusColorScale(getTicketFieldValue(colorByField, ticket) as Status, theme)
      // case 'assignee':
      // case 'creator':
      // case 'title':
      //   return getColorByCategory(getTicketFieldValue(colorByField, ticket) as string)
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

  return [(entity?: Entity) => getColorByColumn(entity), getColorByCategory, getColorByNumber, colorByColumn]
}

const getFieldValue = (entity: Entity, column: FilterColumn): string => {
  return entity.values[column.index]
}

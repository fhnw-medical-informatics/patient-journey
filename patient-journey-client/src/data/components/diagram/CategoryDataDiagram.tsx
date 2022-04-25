import React, { useCallback, useMemo } from 'react'
import { BarDatum, ResponsiveBar } from '@nivo/bar'
import { barColors, DataDiagramsProps, greyColor } from './shared'
import { makeStyles } from '../../../utils'
import { useTheme } from '@mui/material'
import { ColorByColumnNone } from '../../../color/colorSlice'
import { extractCategoryValueSafe } from '../../columns'
import { useAllActiveDataCategories, useUniqueActiveDataCategories } from '../../hooks'

const useStyles = makeStyles()((theme) => ({
  container: {
    width: '100%',
    height: '100px',
  },
  tooltipText: {
    color: theme.palette.text.primary,
    fontSize: '12px',
  },
}))

interface BinDatum {
  readonly binIndex: number
  readonly category: string
  readonly filteredIn: number
  readonly filteredOut: number
}

export type CategoryDiagramProps = DataDiagramsProps<'category'>

export const CategoryDataDiagram = ({
  allActiveData,
  filteredActiveData,
  column,
  colorByColumn,
  colorByCategoryFn,
}: CategoryDiagramProps) => {
  const { classes } = useStyles()
  const theme = useTheme()

  const colors = (node: any) => {
    if (node.id === 'filteredOut') {
      return greyColor(theme)
    } else {
      return colorByCategoryFn(node?.data?.category.valueOf())
    }
  }

  const filteredCategories = useMemo(() => {
    const extractValue = extractCategoryValueSafe(column)
    return filteredActiveData.flatMap(extractValue)
  }, [filteredActiveData, column])

  const allCategories = useAllActiveDataCategories(column)
  const uniqueCategories = useUniqueActiveDataCategories(column)

  const data = useMemo(() => {
    return uniqueCategories.map<BinDatum>((category: string, binIndex: number) => {
      const predicate = (t: string) => t === category

      const allCount = allCategories.filter(predicate).length
      const filteredCount = filteredCategories.filter(predicate).length
      const filteredIn = filteredCount
      const filteredOut = allCount - filteredCount
      return {
        binIndex,
        filteredIn,
        filteredOut,
        category,
      }
    })
  }, [allCategories, filteredCategories, uniqueCategories])

  const tooltip = useCallback(
    ({ index }) => {
      const d = data[index]
      const title = `${d.category}`
      return <div className={classes.tooltipText}>{title}</div>
    },
    [data, classes]
  )

  return (
    <div className={classes.container}>
      <ResponsiveBar
        data={data as unknown as BarDatum[]}
        indexBy={'binIndex'}
        keys={['filteredIn', 'filteredOut']}
        groupMode={'stacked'}
        colors={colorByColumn !== ColorByColumnNone && column.name === colorByColumn.name ? colors : barColors(theme)}
        tooltip={tooltip}
        enableLabel={false}
        enableGridY={false}
      />
    </div>
  )
}

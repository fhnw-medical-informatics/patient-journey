import React, { useCallback, useMemo } from 'react'
import { BarDatum, ResponsiveBarCanvas } from '@nivo/bar'
import { barColors, DataDiagramsProps, greyColor } from './shared'
import { makeStyles } from '../../../utils'
import { useTheme } from '@mui/material'
import { ColorByColumnNone } from '../../../color/colorSlice'
import { useCategories } from './hooks'

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

  const colors = useCallback(
    (node: any) => {
      if (node.id === 'filteredOut') {
        return greyColor(theme)
      } else {
        return colorByCategoryFn(node?.data?.category.valueOf())
      }
    },
    [colorByCategoryFn, theme]
  )

  const { allCategories, uniqueCategories, extractValueSafe } = useCategories(allActiveData, column)

  const allCategoryCount: Map<string, number> = useMemo(
    () =>
      new Map<string, number>(
        uniqueCategories.map((category) => [category, allCategories.filter((c) => c === category).length])
      ),
    [allCategories, uniqueCategories]
  )

  const filteredCategories = useMemo(
    () => filteredActiveData.flatMap(extractValueSafe),
    [filteredActiveData, extractValueSafe]
  )

  const data = useMemo(() => {
    return uniqueCategories.map<BinDatum>((category: string, binIndex: number) => {
      const predicate = (t: string) => t === category

      const allCount = allCategoryCount.get(category) ?? 0
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
  }, [filteredCategories, uniqueCategories, allCategoryCount])

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
      <ResponsiveBarCanvas
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

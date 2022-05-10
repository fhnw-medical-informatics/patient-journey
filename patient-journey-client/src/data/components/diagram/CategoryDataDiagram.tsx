import React, { useCallback, useMemo } from 'react'
import { BarDatum, ResponsiveBarCanvas } from '@nivo/bar'
import { barColors, DataDiagramsProps, greyColor } from './shared'
import { makeStyles } from '../../../utils'
import { useTheme } from '@mui/material'
import { useCategories } from './hooks'
import Tooltip from './Tooltip'
import { FilterColumn } from '../../filtering'

const useStyles = makeStyles()(() => ({
  container: {
    width: '100%',
    height: '100px',
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
  onDataClick,
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

  const tooltip = useCallback(({ data, value, color }) => {
    const title = `${data.category} (${value})`
    return <Tooltip text={title} color={color} />
  }, [])

  const handleBinClick = useCallback(
    (bin) => {
      onDataClick({
        column,
        type: column.type,
        value: {
          categories: [bin.data.category],
        },
      })
    },
    [column, onDataClick]
  )

  return (
    <div className={classes.container}>
      <ResponsiveBarCanvas
        data={data as unknown as BarDatum[]}
        indexBy={'binIndex'}
        keys={['filteredIn', 'filteredOut']}
        groupMode={'stacked'}
        colors={
          colorByColumn.type !== 'none' && column.name === (colorByColumn.column as FilterColumn).name
            ? colors
            : barColors(theme)
        }
        tooltip={tooltip}
        enableLabel={false}
        enableGridY={false}
        onClick={handleBinClick}
      />
    </div>
  )
}

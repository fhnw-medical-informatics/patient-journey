import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { BarDatum, BarTooltipProps, ComputedDatum, ResponsiveBarCanvas } from '@nivo/bar'
import { barColors, DataDiagramsProps, greyColor } from './shared'
import { makeStyles } from '../../../utils'
import { useTheme } from '@mui/material'
import { useCategories } from './hooks'
import Tooltip from './Tooltip'
import { FilterColumn } from '../../filtering'

import CategoryCountsWorker from '../../workers/create-category-counts?worker'
import { useWorker } from '../../workers/hooks'

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

  const [isFilteredCategoryCountWorkerReady, postMessageToFilteredCategoryCountWorker] = useWorker(
    CategoryCountsWorker,
    (event) => {
      setFilteredCategoryCount(event.data)
    }
  )
  const [isAllCategoryCountWorkerReady, postMessageToAllCategoryCountWorker] = useWorker(
    CategoryCountsWorker,
    (event) => {
      setAllCategoryCount(event.data)
    }
  )

  const [allCategoryCount, setAllCategoryCount] = useState<Map<string, number>>(new Map())
  const [filteredCategoryCount, setFilteredCategoryCount] = useState<Map<string, number>>(new Map())

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

  const filteredCategories = useMemo(
    () => filteredActiveData.flatMap(extractValueSafe),
    [filteredActiveData, extractValueSafe]
  )

  useEffect(() => {
    if (isAllCategoryCountWorkerReady) {
      const message = {
        categories: allCategories,
        uniqueCategories,
      }
      postMessageToAllCategoryCountWorker(message)
    }
  }, [isAllCategoryCountWorkerReady, postMessageToAllCategoryCountWorker, allCategories, uniqueCategories])

  useEffect(() => {
    if (isFilteredCategoryCountWorkerReady) {
      const message = {
        categories: filteredCategories,
        uniqueCategories,
      }
      postMessageToFilteredCategoryCountWorker(message)
    }
  }, [
    isFilteredCategoryCountWorkerReady,
    postMessageToFilteredCategoryCountWorker,
    filteredCategories,
    uniqueCategories,
  ])

  const data = useMemo(() => {
    return uniqueCategories.map<BinDatum>((category: string, binIndex: number) => {
      const allCount = allCategoryCount.get(category) ?? 0
      const filteredCount = filteredCategoryCount.get(category) ?? 0
      const filteredIn = filteredCount
      const filteredOut = allCount - filteredCount
      return {
        binIndex,
        filteredIn,
        filteredOut,
        category,
      }
    })
  }, [filteredCategoryCount, uniqueCategories, allCategoryCount])

  const tooltip = useCallback<React.FC<BarTooltipProps<any>>>(({ data, value, color }) => {
    const title = `${data.category} (${value})`
    return <Tooltip text={title} color={color} />
  }, [])

  const handleBinClick = useCallback(
    (bin: ComputedDatum<any>) => {
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

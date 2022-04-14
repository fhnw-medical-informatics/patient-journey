import React, { useCallback, useMemo } from 'react'
import { BarDatum, ResponsiveBar } from '@nivo/bar'
import { barColors, DataDiagramsProps, greyColor } from './shared'
import { makeStyles } from '../../../utils'
import { useTheme } from '@mui/material'
import { ColorByColumnNone } from '../../../color/colorSlice'
import { extractQualityValueSafe } from '../../columns'
import { useAllActiveDataQualities, useUniqueActiveDataQualities } from '../../hooks'

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
  readonly quality: string
  readonly filteredIn: number
  readonly filteredOut: number
}

export type QualityDiagramProps = DataDiagramsProps<'quality'>

export const QualityDataDiagram = ({
  allActiveData,
  filteredActiveData,
  column,
  colorByColumn,
  colorByCategoryFn,
}: QualityDiagramProps) => {
  const { classes } = useStyles()
  const theme = useTheme()

  const colors = (node: any) => {
    if (node.id === 'filteredOut') {
      return greyColor(theme)
    } else {
      return colorByCategoryFn(node?.data?.quality.valueOf())
    }
  }

  const filteredQualities = useMemo(() => {
    const extractValue = extractQualityValueSafe(column)
    return filteredActiveData.flatMap(extractValue)
  }, [filteredActiveData, column])

  const allQualities = useAllActiveDataQualities(column)
  const uniqueQualities = useUniqueActiveDataQualities(column)

  const data = useMemo(() => {
    return uniqueQualities.map<BinDatum>((quality: string, binIndex: number) => {
      const predicate = (t: string) => t === quality

      const allCount = allQualities.filter(predicate).length
      const filteredCount = filteredQualities.filter(predicate).length
      const filteredIn = filteredCount
      const filteredOut = allCount - filteredCount
      return {
        binIndex,
        filteredIn,
        filteredOut,
        quality,
      }
    })
  }, [allQualities, filteredQualities, uniqueQualities])

  const tooltip = useCallback(
    ({ index }) => {
      const d = data[index]
      const title = `${d.quality}`
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

import React, { useCallback, useMemo } from 'react'
import { BarDatum, ResponsiveBar } from '@nivo/bar'
import { DataDiagramsProps, greyColor } from './shared'
import { makeStyles } from '../../../utils'
import { useTheme } from '@mui/material'
import { barColors } from './shared'
import { ColorByColumnNone } from '../../../color/colorSlice'
import { extractQualityValueSafe } from '../../columns'

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

  const extractValueSafe = useMemo(() => extractQualityValueSafe(column), [column])

  const allQualities = useMemo(() => allActiveData.flatMap(extractValueSafe), [allActiveData, extractValueSafe])

  const filteredQualities = useMemo(
    () => filteredActiveData.flatMap(extractValueSafe),
    [filteredActiveData, extractValueSafe]
  )

  const qualities = useMemo(() => [...new Set(allQualities)], [allQualities])

  const data = useMemo(() => {
    return qualities.map<BinDatum>((quality: string, binIndex: number) => {
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
  }, [allQualities, filteredQualities, qualities])

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

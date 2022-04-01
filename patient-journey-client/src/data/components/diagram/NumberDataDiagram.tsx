import React, { useCallback, useMemo } from 'react'
import { bin, extent } from 'd3-array'
import { ScaleLinear, scaleLinear } from 'd3-scale'
import { BarDatum, ResponsiveBar } from '@nivo/bar'
import { DataDiagramsProps } from './DataDiagrams'
import { makeStyles } from '../../../utils'
import { Entity } from '../../entities'
import { useTheme } from '@mui/material'
import { barColors } from './shared'
import { ColorByColumnNone } from '../../../color/colorSlice'

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

const histogramBinCount = 10

function createBins(numbers: number[], timeScale: ScaleLinear<number, number>) {
  const [min, max] = timeScale.domain()
  return bin<number, number>().domain([min, max]).thresholds(timeScale.ticks(histogramBinCount))(numbers)
}

interface BinDatum {
  readonly binIndex: number
  readonly binStart?: number
  readonly binEnd?: number
  readonly filteredIn: number
  readonly filteredOut: number
}

export type NumberDiagramProps = DataDiagramsProps

// TODO: Merge with "DateDataDiagram" as most logic is shared except scale and typings
export const NumberDataDiagram = ({
  allActiveData,
  filteredActiveData,
  column,
  colorByColumn,
  colorByNumberFn,
}: NumberDiagramProps) => {
  const { classes } = useStyles()
  const theme = useTheme()

  const extractValueUndefinedSafe = (d: Entity) => {
    const value = d.values[column.index] ?? ''

    if (value === null || value.trim().length === 0) {
      return []
    }

    switch (column.type) {
      case 'number':
        return [parseFloat(value)]
      default:
        throw new Error('Unsupported Format')
    }
  }
  const allNumbers = allActiveData.flatMap(extractValueUndefinedSafe)
  const filteredNumbers = filteredActiveData.flatMap(extractValueUndefinedSafe)

  const colors = (node: any) => colorByNumberFn(node?.data?.binEnd?.valueOf())

  const data = useMemo(() => {
    // universe of all tickets determines bin structure
    const [min, max] = extent(allNumbers)
    const timeScale = scaleLinear<number, number>().domain([min!, max!]).nice()

    const allTicketBins = createBins(allNumbers, timeScale)
    const filteredTicketBins = createBins(filteredNumbers, timeScale)

    return (
      allTicketBins
        .map<BinDatum>((_, binIndex) => {
          const allTicketBin = allTicketBins[binIndex]
          const binStart = allTicketBin.x0
          const binEnd = allTicketBin.x1
          const filteredTicketBin = filteredTicketBins[binIndex]
          const allCount = (allTicketBin && allTicketBin.length) ?? 0
          const filteredCount = (filteredTicketBin && filteredTicketBin.length) ?? 0
          return {
            binIndex,
            binStart,
            binEnd,
            filteredIn: filteredCount,
            filteredOut: allCount - filteredCount,
          }
        })
        // Remove the last bin if it is empty
        .reduce<BinDatum[]>((acc, bin, binIndex) => {
          if (bin.filteredIn === 0 && bin.filteredOut === 0 && binIndex === allTicketBins.length - 1) {
            return acc
          }
          return [...acc, bin]
        }, [])
    )
  }, [allNumbers, filteredNumbers])

  const tooltip = useCallback(
    ({ index }) => {
      const d = data[index]
      const dateRange = `${d.binStart !== undefined ? d.binStart : ''} - ${d.binEnd !== undefined ? d.binEnd : ''}`
      return <div className={classes.tooltipText}>{dateRange}</div>
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

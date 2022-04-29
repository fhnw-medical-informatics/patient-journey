import React, { useCallback, useMemo } from 'react'
import { bin } from 'd3-array'
import { ScaleTime, scaleTime } from 'd3-scale'
import { BarDatum, ResponsiveBarCanvas } from '@nivo/bar'
import { format } from '../../columns'
import { barColors, DataDiagramsProps, greyColor } from './shared'
import { makeStyles } from '../../../utils'
import { useTheme } from '@mui/material'
import { ColorByColumnNone } from '../../../color/colorSlice'
import { useDates } from './hooks'

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

function createBins(dates: ReadonlyArray<Date>, timeScale: ScaleTime<Date, Date>) {
  const [min, max] = timeScale.domain()
  return bin<Date, Date>().domain([min, max]).thresholds(timeScale.ticks(histogramBinCount))(dates)
}

interface BinDatum {
  readonly binIndex: number
  readonly binStart?: Date
  readonly binEnd?: Date
  readonly filteredIn: number
  readonly filteredOut: number
}

export type DateDataDiagramProps = DataDiagramsProps<'date' | 'timestamp'>

export const DateDataDiagram = ({
  allActiveData,
  filteredActiveData,
  column,
  colorByColumn,
  colorByNumberFn,
}: DateDataDiagramProps) => {
  const { classes } = useStyles()
  const theme = useTheme()

  const colors = useCallback(
    (node: any) => {
      if (node.id === 'filteredOut') {
        return greyColor(theme)
      } else {
        return colorByNumberFn(node?.data?.binEnd?.valueOf())
      }
    },
    [colorByNumberFn, theme]
  )

  const { allDates, min, max, extractValueSafe } = useDates(allActiveData, column)

  const filteredDates = useMemo(
    () => filteredActiveData.flatMap(extractValueSafe),
    [filteredActiveData, extractValueSafe]
  )

  const timeScale = useMemo(() => scaleTime<Date, Date>().domain([min!, max!]).nice(), [min, max])

  const allTicketBins = useMemo(() => createBins(allDates, timeScale), [allDates, timeScale])

  const data = useMemo(() => {
    // universe of all tickets determines bin structure
    const filteredTicketBins = createBins(filteredDates, timeScale)

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
        .reduce<BinDatum[]>(
          (acc, curr, currIndex) =>
            curr.filteredIn === 0 && curr.filteredOut === 0 && currIndex === allTicketBins.length - 1
              ? acc
              : [...acc, curr],
          []
        )
    )
  }, [allTicketBins, filteredDates, timeScale])

  const tooltip = useCallback(
    ({ index }) => {
      const d = data[index]
      const dateRange = `${
        d.binStart !== undefined ? format(d.binStart, column.type === 'date' ? 'dd.MM.yyyy' : 'dd.MM.yyyy HH:mm') : ''
      } - ${d.binEnd !== undefined ? format(d.binEnd, column.type === 'date' ? 'dd.MM.yyyy' : 'dd.MM.yyyy HH:mm') : ''}`
      return <div className={classes.tooltipText}>{dateRange}</div>
    },
    [data, classes, column]
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

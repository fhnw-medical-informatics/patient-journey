import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Bin } from 'd3-array'
import { BarDatum, BarTooltipProps, ComputedDatum, ResponsiveBarCanvas } from '@nivo/bar'
import { format } from '../../columns'
import { barColors, DataDiagramsProps, greyColor } from './shared'
import { makeStyles } from '../../../utils'
import { useTheme } from '@mui/material'
import { useDates } from './hooks'
import Tooltip from './Tooltip'
import { FilterColumn } from '../../filtering'

import DateBinWorker from '../../workers/create-date-bins?worker'
import { useWorker } from '../../workers/hooks'

const useStyles = makeStyles()((theme) => ({
  container: {
    width: '100%',
    height: '100px',
  },
}))

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
  onDataClick,
  colorByColumn,
  colorByNumberFn,
}: DateDataDiagramProps) => {
  const { classes } = useStyles()
  const theme = useTheme()

  const [isFilteredDateBinWorkerReady, postMessageToFilteredDateBinWorker] = useWorker(DateBinWorker, (event) => {
    setfilteredTicketBins(event.data)
  })
  const [isAllDateBinWorkerReady, postMessageToAllDateBinWorker] = useWorker(DateBinWorker, (event) => {
    setAllTicketBins(event.data)
  })

  const [allTicketBins, setAllTicketBins] = useState<Bin<Date, Date>[]>([])
  const [filteredTicketBins, setfilteredTicketBins] = useState<Bin<Date, Date>[]>([])

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

  useEffect(() => {
    if (isAllDateBinWorkerReady) {
      const message = {
        dates: allDates,
        min,
        max,
      }
      postMessageToAllDateBinWorker(message)
    }
  }, [isAllDateBinWorkerReady, postMessageToAllDateBinWorker, allDates, min, max])

  useEffect(() => {
    if (isFilteredDateBinWorkerReady) {
      const message = {
        dates: filteredDates,
        min,
        max,
      }
      postMessageToFilteredDateBinWorker(message)
    }
  }, [isFilteredDateBinWorkerReady, postMessageToFilteredDateBinWorker, filteredDates, min, max])

  const data = useMemo(() => {
    // universe of all tickets determines bin structure
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
  }, [allTicketBins, filteredTicketBins])

  const tooltip = useCallback<React.FC<BarTooltipProps<any>>>(
    ({ data, value, color }) => {
      const dateRange = `${
        data.binStart !== undefined
          ? format(data.binStart, column.type === 'date' ? 'dd.MM.yyyy' : 'dd.MM.yyyy HH:mm')
          : ''
      } - ${
        data.binEnd !== undefined ? format(data.binEnd, column.type === 'date' ? 'dd.MM.yyyy' : 'dd.MM.yyyy HH:mm') : ''
      } (${value})`
      return <Tooltip text={dateRange} color={color} />
    },
    [column]
  )

  const handleBinClick = useCallback(
    (bin: ComputedDatum<BarDatum>) => {
      onDataClick({
        column,
        type: column.type,
        value: {
          millisFrom: +bin.data.binStart,
          millisTo: +bin.data.binEnd,
          toInclusive: +bin.data.binIndex >= allTicketBins.length - 1, // Only last bin is inclusive
        },
      })
    },
    [column, onDataClick, allTicketBins]
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

import React, { useCallback, useMemo } from 'react'
import { BarDatum, BarTooltipProps, ComputedDatum, ResponsiveBarCanvas } from '@nivo/bar'
import { barColors, DataDiagramsProps, greyColor } from './shared'
import { makeStyles } from '../../../utils'
import { useTheme } from '@mui/material'
import { useNumbers } from './hooks'
import Tooltip from './Tooltip'
import { FilterColumn } from '../../filtering'

import NumberBinWorker from '../../workers/create-number-bins?worker'
import { NumbersBinWorkerData, NumbersBinWorkerResponse } from '../../workers/create-number-bins'

import { useWorker } from '../../workers/hooks'

const useStyles = makeStyles()((theme) => ({
  container: {
    width: '100%',
    height: '100px',
  },
}))

interface BinDatum {
  readonly binIndex: number
  readonly binStart?: number
  readonly binEnd?: number
  readonly filteredIn: number
  readonly filteredOut: number
}

export type NumberDiagramProps = DataDiagramsProps<'number'>

// TODO: Merge with "DateDataDiagram" as most logic is shared except scale and typings
export const NumberDataDiagram = ({
  allActiveData,
  filteredActiveData,
  onDataClick,
  column,
  colorByColumn,
  colorByNumberFn,
}: NumberDiagramProps) => {
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

  const { allNumbers, niceMin, niceMax, extractValueSafe } = useNumbers(allActiveData, column)

  const filteredNumbers = useMemo(
    () => filteredActiveData.flatMap(extractValueSafe),
    [filteredActiveData, extractValueSafe]
  )

  const allNumbersWorkerData = useMemo(
    () => ({ numbers: allNumbers, min: niceMin, max: niceMax }),
    [allNumbers, niceMin, niceMax]
  )

  const allTicketBins = useWorker<NumbersBinWorkerData, NumbersBinWorkerResponse>(
    NumberBinWorker,
    allNumbersWorkerData,
    []
  )

  const filteredNumbersWorkerData = useMemo(
    () => ({ numbers: filteredNumbers, min: niceMin, max: niceMax }),
    [filteredNumbers, niceMin, niceMax]
  )

  const filteredTicketBins = useWorker<NumbersBinWorkerData, NumbersBinWorkerResponse>(
    NumberBinWorker,
    filteredNumbersWorkerData,
    []
  )

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
        .reduce<BinDatum[]>((acc, bin, binIndex) => {
          if (bin.filteredIn === 0 && bin.filteredOut === 0 && binIndex === allTicketBins.length - 1) {
            return acc
          }
          return [...acc, bin]
        }, [])
    )
  }, [allTicketBins, filteredTicketBins])

  const tooltip = useCallback<React.FC<BarTooltipProps<BarDatum>>>(({ data, value, color }) => {
    const dateRange = `${data.binStart !== undefined ? data.binStart : ''} - ${
      data.binEnd !== undefined ? data.binEnd : ''
    }  (${value})`
    return <Tooltip text={dateRange} color={color} />
  }, [])

  const handleBinClick = useCallback(
    (bin: ComputedDatum<BarDatum>) => {
      onDataClick({
        column,
        type: column.type,
        value: {
          from: +bin.data.binStart,
          to: +bin.data.binEnd,
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

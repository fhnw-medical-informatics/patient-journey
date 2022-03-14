import React, { useCallback, useMemo } from 'react'

import { bin, extent } from 'd3-array'
import { ScaleTime, scaleTime } from 'd3-scale'

import { BarDatum, ResponsiveBar } from '@nivo/bar'

import { parseDate, parseMillis, format } from '../../columns'
import { PatientJourneyEvent } from '../../events'
import { Patient } from '../../patients'
import { DataDiagramsProps } from './DataDiagrams'
import { makeStyles } from '../../../utils'

const useStyles = makeStyles()((theme) => ({
  container: {
    width: '100%',
    height: '100px',
  },
  tooltipText: {
    color: 'white',
    fontSize: '12px',
  },
}))

const histogramBinCount = 10

function createBins(dates: Date[], timeScale: ScaleTime<Date, Date>) {
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

export type DateDataDiagramProps = DataDiagramsProps

export const DateDataDiagram = ({ allActiveData, filteredActiveData, column }: DateDataDiagramProps) => {
  const { classes } = useStyles()

  const extractValueUndefinedSafe = (d: Patient | PatientJourneyEvent) => {
    const value = d.values[column.index] ?? ''

    if (value === null || value.trim().length === 0) {
      return []
    }

    switch (column.type) {
      case 'date':
        return [parseDate(value)]
      case 'timestamp':
        return [parseMillis(+value)]
      default:
        throw new Error('Unsupported Format')
    }
  }
  const allDates = (allActiveData.type === 'patients' ? allActiveData.allPatients : allActiveData.allEvents).flatMap(
    extractValueUndefinedSafe
  )
  const filteredDates = (
    filteredActiveData.type === 'patients' ? filteredActiveData.allPatients : filteredActiveData.allEvents
  ).flatMap(extractValueUndefinedSafe)

  // TODO: Support coloring
  // const colors = (node: any) => colorByNumberFn(node?.data?.binEnd?.valueOf())

  const data = useMemo(() => {
    // universe of all tickets determines bin structure
    const [min, max] = extent(allDates)
    const timeScale = scaleTime<Date, Date>().domain([min!, max!]).nice()

    const allTicketBins = createBins(allDates, timeScale)
    const filteredTicketBins = createBins(filteredDates, timeScale)

    return allTicketBins.map<BinDatum>((_, binIndex) => {
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
  }, [allDates, filteredDates])

  const tooltip = useCallback(
    ({ index }) => {
      const d = data[index]
      const dateRange = `${
        d.binStart ? format(d.binStart, column.type === 'date' ? 'dd.MM.yyyy' : 'dd.MM.yyyy HH:mm') : ''
      } - ${d.binEnd ? format(d.binEnd, column.type === 'date' ? 'dd.MM.yyyy' : 'dd.MM.yyyy HH:mm') : ''}`
      return <div className={classes.tooltipText}>{dateRange}</div>
    },
    [data, classes, column]
  )

  return (
    <div className={classes.container}>
      <ResponsiveBar
        data={data as unknown as BarDatum[]}
        indexBy={'binIndex'}
        keys={['filteredIn', 'filteredOut']}
        groupMode={'stacked'}
        //colors={field === colorByField ? colors : barColors(theme)}
        tooltip={tooltip}
        enableLabel={false}
        enableGridY={false}
      />
    </div>
  )
}

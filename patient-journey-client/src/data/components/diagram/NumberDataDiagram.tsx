import React, { useCallback, useMemo } from 'react'

import { bin, extent } from 'd3-array'
import { ScaleLinear, scaleLinear } from 'd3-scale'

import { BarDatum, ResponsiveBar } from '@nivo/bar'

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
export const NumberDataDiagram = ({ allActiveData, filteredActiveData, column }: NumberDiagramProps) => {
  const { classes } = useStyles()

  const extractValueUndefinedSafe = (d: Patient | PatientJourneyEvent) => {
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
  const allNumbers = (allActiveData.type === 'patients' ? allActiveData.allPatients : allActiveData.allEvents).flatMap(
    extractValueUndefinedSafe
  )
  const filteredNumbers = (
    filteredActiveData.type === 'patients' ? filteredActiveData.allPatients : filteredActiveData.allEvents
  ).flatMap(extractValueUndefinedSafe)

  // TODO: Support coloring
  // const colors = (node: any) => colorByNumberFn(node?.data?.binEnd?.valueOf())

  const data = useMemo(() => {
    // universe of all tickets determines bin structure
    const [min, max] = extent(allNumbers)
    const timeScale = scaleLinear<number, number>().domain([min!, max!]).nice()

    const allTicketBins = createBins(allNumbers, timeScale)
    const filteredTicketBins = createBins(filteredNumbers, timeScale)

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
  }, [allNumbers, filteredNumbers])

  const tooltip = useCallback(
    ({ index }) => {
      const d = data[index]
      const dateRange = `${d.binStart ? d.binStart : ''} - ${d.binEnd ? d.binEnd : ''}`
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
        //colors={field === colorByField ? colors : barColors(theme)}
        tooltip={tooltip}
        enableLabel={false}
        enableGridY={false}
      />
    </div>
  )
}

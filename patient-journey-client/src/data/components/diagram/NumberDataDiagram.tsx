import React, { useCallback, useMemo } from 'react'
import { bin, extent } from 'd3-array'
import { ScaleLinear, scaleLinear } from 'd3-scale'
import { BarDatum, ResponsiveBarCanvas } from '@nivo/bar'
import { barColors, DataDiagramsProps, greyColor } from './shared'
import { makeStyles } from '../../../utils'
import { useTheme } from '@mui/material'
import { ColorByColumnNone } from '../../../color/colorSlice'
import { extractNumberValueSafe } from '../../columns'
import { Tooltip } from './Tooltip'

const useStyles = makeStyles()((theme) => ({
  container: {
    width: '100%',
    height: '100px',
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

export type NumberDiagramProps = DataDiagramsProps<'number'>

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

  const extractValueSafe = useMemo(() => extractNumberValueSafe(column), [column])

  const allNumbers = useMemo(() => allActiveData.flatMap(extractValueSafe), [allActiveData, extractValueSafe])

  const filteredNumbers = useMemo(
    () => filteredActiveData.flatMap(extractValueSafe),
    [filteredActiveData, extractValueSafe]
  )

  const [min, max] = useMemo(() => extent(allNumbers), [allNumbers])

  const timeScale = useMemo(() => scaleLinear<number, number>().domain([min!, max!]).nice(), [min, max])

  const allTicketBins = useMemo(() => createBins(allNumbers, timeScale), [allNumbers, timeScale])

  const data = useMemo(() => {
    // universe of all tickets determines bin structure
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
  }, [allTicketBins, filteredNumbers, timeScale])

  return (
    <div className={classes.container}>
      <ResponsiveBarCanvas
        data={data as unknown as BarDatum[]}
        indexBy={'binIndex'}
        keys={['filteredIn', 'filteredOut']}
        groupMode={'stacked'}
        colors={colorByColumn !== ColorByColumnNone && column.name === colorByColumn.name ? colors : barColors(theme)}
        tooltip={(props) => (
          <Tooltip {...props}>
            {(node) =>
              `${node.binStart !== undefined ? node.binStart : ''} - ${node.binEnd !== undefined ? node.binEnd : ''}`
            }
          </Tooltip>
        )}
        enableLabel={false}
        enableGridY={false}
      />
    </div>
  )
}

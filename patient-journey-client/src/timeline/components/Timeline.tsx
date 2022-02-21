import React from 'react'
import { makeStyles } from '../../utils'
import { Timeline as SVGTimeline, LaneDisplayMode } from 'react-svg-timeline'
import datasetJSON from './dataset.json'
import { Paper } from '@mui/material'
import AutoSizer, { Size } from 'react-virtualized-auto-sizer'

const useStyles = makeStyles()({
  root: {
    //display: 'grid',
    width: '100%',
    height: '100%',
    //placeItems: 'center',
  },
})

interface DemoTimelineProps {
  dateFormat: (ms: number) => string
  laneDisplayMode: LaneDisplayMode
}

export const Timeline = ({ dateFormat, laneDisplayMode }: DemoTimelineProps) => {
  const { classes } = useStyles()

  const { lanes, events } = datasetJSON

  return (
    <Paper className={classes.root}>
      <AutoSizer>
        {({ width, height }: Size) => {
          return (
            <SVGTimeline
              width={width}
              height={height}
              events={events}
              lanes={lanes}
              dateFormat={dateFormat}
              laneDisplayMode={laneDisplayMode}
            />
          )
        }}
      </AutoSizer>
    </Paper>
  )
}

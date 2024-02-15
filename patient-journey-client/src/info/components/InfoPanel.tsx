import React from 'react'
import { Card, TextField } from '@mui/material'
import { makeStyles } from '../../utils'
import { PatientId } from '../../data/patients'
import { EventId } from '../../data/events'
import { ColorByInfoField } from './ColorByInfoField'
import { ColorByInfo } from '../../color/hooks'
import { ScatterPlotInfo } from '../../plot/model'

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'grid',
    width: '100%',
    height: '100%',
    padding: theme.spacing(2),
    gridTemplateColumns: '1fr',
    gap: theme.spacing(2),
    alignContent: 'start',
  },
}))

interface PatientInfo {
  readonly pid: PatientId
  readonly pidColumnName: string
}

interface EventInfo {
  readonly eid: EventId
  readonly eidColumnName: string
  readonly timestampColumnName: string
  readonly timestampValue: string
}

export type FocusEntityInfo =
  | Readonly<{ type: 'no-info' }>
  | Readonly<{
      type: 'patient-info'
      patientInfo: PatientInfo
    }>
  | Readonly<{
      type: 'event-info'
      patientInfo: PatientInfo
      eventInfo: EventInfo
    }>

interface Props {
  readonly focusEntityInfo: FocusEntityInfo
  readonly colorByInfo: ColorByInfo
  readonly scatterPlotInfo: ScatterPlotInfo
}

export const InfoPanel = ({ focusEntityInfo, colorByInfo, scatterPlotInfo }: Props) => {
  const { classes } = useStyles()
  return (
    <Card variant="outlined" className={classes.root}>
      {focusEntityInfo.type !== 'no-info' && (
        <TextField
          size={'small'}
          label={focusEntityInfo.patientInfo.pidColumnName}
          value={focusEntityInfo.patientInfo.pid}
          InputProps={{
            readOnly: true,
          }}
        />
      )}
      {focusEntityInfo.type === 'event-info' && (
        <>
          <TextField
            size={'small'}
            label={focusEntityInfo.eventInfo.eidColumnName}
            value={focusEntityInfo.eventInfo.eid}
            InputProps={{
              readOnly: true,
            }}
          />
          <TextField
            size={'small'}
            label={focusEntityInfo.eventInfo.timestampColumnName}
            value={focusEntityInfo.eventInfo.timestampValue}
            InputProps={{
              readOnly: true,
            }}
          />
        </>
      )}
      {scatterPlotInfo !== 'none' && (
        <>
          <TextField
            size={'small'}
            label={scatterPlotInfo.xAxisLabel}
            value={scatterPlotInfo.xValueFormatted}
            InputProps={{
              readOnly: true,
            }}
          />
          <TextField
            size={'small'}
            label={scatterPlotInfo.yAxisLabel}
            value={scatterPlotInfo.yValueFormatted}
            InputProps={{
              readOnly: true,
            }}
          />
        </>
      )}
      <ColorByInfoField colorByInfo={colorByInfo} />
    </Card>
  )
}

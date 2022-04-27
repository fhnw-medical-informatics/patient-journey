import React from 'react'
import { Card, TextField } from '@mui/material'
import { makeStyles } from '../../../utils'
import { PatientId } from '../../patients'
import { EventId } from '../../events'
import { ColorByInfoField } from './ColorByInfoField'
import { ColorByInfo } from '../../../color/hooks'

const useStyles = makeStyles()((theme) => ({
  root: {
    display: 'grid',
    width: '100%',
    height: '100%',
    padding: theme.spacing(1),
    gridTemplateColumns: '1fr',
    gridGap: theme.spacing(1),
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
}

export const InfoPanel = ({ focusEntityInfo, colorByInfo }: Props) => {
  const { classes } = useStyles()
  return (
    <Card className={classes.root}>
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
      <ColorByInfoField colorByInfo={colorByInfo} />
    </Card>
  )
}

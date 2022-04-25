import React from 'react'
import { Card, TextField } from '@mui/material'
import { makeStyles } from '../../../utils'
import { PatientId } from '../../patients'
import { EventId } from '../../events'

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
}

export type ActiveEntityInfo =
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
  readonly activeEntityInfo: ActiveEntityInfo
}

export const InfoPanel = ({ activeEntityInfo }: Props) => {
  const { classes } = useStyles()
  return (
    <Card className={classes.root}>
      {activeEntityInfo.type !== 'no-info' && (
        <TextField
          size={'small'}
          label={activeEntityInfo.patientInfo.pidColumnName}
          value={activeEntityInfo.patientInfo.pid}
          InputProps={{
            readOnly: true,
          }}
        />
      )}
      {activeEntityInfo.type === 'event-info' && (
        <TextField
          size={'small'}
          label={activeEntityInfo.eventInfo.eidColumnName}
          value={activeEntityInfo.eventInfo.eid}
          InputProps={{
            readOnly: true,
          }}
        />
      )}
    </Card>
  )
}

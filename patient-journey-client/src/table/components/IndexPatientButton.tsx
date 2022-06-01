import React from 'react'

import { IconButton, Tooltip, useTheme } from '@mui/material'

import StarIcon from '@mui/icons-material/Star'
import StarOutlinedIcon from '@mui/icons-material/StarOutline'
import ErrorIcon from '@mui/icons-material/Error'
import { PatientId } from '../../data/patients'

export interface IndexPatientButtonProps {
  readonly patientId: PatientId
  readonly indexPatientId: PatientId
  readonly isLoading: boolean
  readonly error?: string
  readonly onSetIndexPatient: (pid: PatientId) => void
  readonly onResetIndexPatient: () => void
}

export const IndexPatientButton = ({
  patientId,
  indexPatientId,
  isLoading,
  error,
  onResetIndexPatient,
  onSetIndexPatient,
}: IndexPatientButtonProps) => {
  const theme = useTheme()

  const isIndexPatient = indexPatientId === patientId

  const Button = (
    <IconButton
      size="small"
      className={isIndexPatient ? '' : 'idx-patient'}
      onClick={(e) => {
        e.stopPropagation()

        if (isIndexPatient) {
          onResetIndexPatient()
        } else {
          onSetIndexPatient(patientId)
        }
      }}
      sx={{
        color: error ? theme.palette.error.main : theme.entityColors.indexPatient,
      }}
      disabled={isLoading}
    >
      {error ? (
        <ErrorIcon fontSize="inherit" />
      ) : isIndexPatient ? (
        <StarIcon fontSize="inherit" />
      ) : (
        <StarOutlinedIcon fontSize="inherit" />
      )}
    </IconButton>
  )

  return isLoading ? (
    Button
  ) : (
    <Tooltip
      enterDelay={150}
      enterNextDelay={1500}
      placement="right"
      arrow
      title={error ? error : isIndexPatient ? 'Unset index patient' : 'Set as index patient'}
    >
      {Button}
    </Tooltip>
  )
}

import { Button, useTheme } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import CohortIcon from '@mui/icons-material/Grain'
import React, { useCallback } from 'react'
import { PatientId } from '../../patients'

interface Props {
  readonly patientId: PatientId
  readonly isInCohort: boolean
  readonly addToCohort: (id: PatientId) => void
  readonly removeFromCohort: (id: PatientId) => void
}

export const CohortControlButton = ({ patientId, isInCohort, addToCohort, removeFromCohort }: Props) => {
  const theme = useTheme()

  const onClick = useCallback(() => {
    isInCohort ? removeFromCohort(patientId) : addToCohort(patientId)
  }, [patientId, isInCohort, addToCohort, removeFromCohort])

  return (
    <div style={{ color: theme.entityColors.cohort }}>
      <Button
        onClick={onClick}
        variant="outlined"
        size="small"
        startIcon={<CohortIcon />}
        endIcon={isInCohort ? <RemoveIcon /> : <AddIcon />}
        color={'inherit'}
        sx={{ lineHeight: 1 }}
      >
        {isInCohort ? 'Remove from Cohort' : 'Add to Cohort'}
      </Button>
    </div>
  )
}

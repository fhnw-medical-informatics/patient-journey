import { CohortControlButton as CohortControlButtonComponent } from '../components/CohortControlButton'
import { useSelectedEntity } from '../../data/hooks'
import { usePatientCohort } from '../hooks'
import { addToCohort, removeFromCohort } from '../cohortSlice'
import { useAppDispatch } from '../../store'
import { useCallback } from 'react'
import { PatientId } from '../../data/patients'

export const CohortControlButton = () => {
  const selectedEntity = useSelectedEntity()
  const cohort = usePatientCohort()

  const dispatch = useAppDispatch()

  const handleAddToCohort = useCallback(
    (id: PatientId) => {
      dispatch(addToCohort({ id }))
    },
    [dispatch]
  )

  const handleRemoveFromCohort = useCallback(
    (id: PatientId) => {
      dispatch(removeFromCohort({ id }))
    },
    [dispatch]
  )

  if (selectedEntity.type === 'patients') {
    return (
      <CohortControlButtonComponent
        patientId={selectedEntity.uid}
        isInCohort={cohort.has(selectedEntity.uid)}
        addToCohort={handleAddToCohort}
        removeFromCohort={handleRemoveFromCohort}
      />
    )
  }
  return null
}

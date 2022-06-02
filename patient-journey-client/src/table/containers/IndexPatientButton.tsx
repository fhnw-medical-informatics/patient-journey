import React, { useCallback } from 'react'
import { resetIndexPatient, setIndexPatient } from '../../data/dataSlice'
import {
  useIndexPatientId,
  useSimilarityDataLoadingErrorMessage,
  useSimilarityDataLoadingState,
} from '../../data/hooks'
import { PatientId } from '../../data/patients'
import { useAppDispatch } from '../../store'

import { IndexPatientButton as IndexPatientButtonComponent } from '../components/IndexPatientButton'

interface IndexPatientButtonProps {
  readonly patientId: PatientId
}

export const IndexPatientButton = ({ patientId }: IndexPatientButtonProps) => {
  const indexPatientId = useIndexPatientId()
  const loadingState = useSimilarityDataLoadingState()
  const errorMessage = useSimilarityDataLoadingErrorMessage()

  const dispatch = useAppDispatch()

  const onSetIndexPatient = useCallback(
    (pid: PatientId) => {
      dispatch(setIndexPatient(pid))
    },
    [dispatch]
  )

  const onResetIndexPatient = useCallback(() => {
    dispatch(resetIndexPatient())
  }, [dispatch])

  return (
    <IndexPatientButtonComponent
      patientId={patientId}
      indexPatientId={indexPatientId}
      isLoading={loadingState === 'loading-in-progress'}
      error={loadingState === 'loading-failed' ? errorMessage : undefined}
      onSetIndexPatient={onSetIndexPatient}
      onResetIndexPatient={onResetIndexPatient}
    />
  )
}

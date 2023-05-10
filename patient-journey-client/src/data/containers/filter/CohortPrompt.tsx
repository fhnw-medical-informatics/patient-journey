import React, { useCallback, useMemo } from 'react'

import CohortPromptComponent from '../../components/filter/CohortPrompt'
import {
  useCohortExplanationPrompt,
  useCohortExplanationState,
  useCohortExplanationResult,
  usePatientDataRowAsMap,
} from '../../hooks'
import { useAppDispatch } from '../../../store'
import { PatientId, Patient } from '../../patients'
import { fetchCohortExplanation, setCohortExplanationPrompt } from '../../dataSlice'

const CohortPrompt = () => {
  const prompt = useCohortExplanationPrompt()
  const result = useCohortExplanationResult()
  const state = useCohortExplanationState()

  const patientMap = usePatientDataRowAsMap()

  const dispatch = useAppDispatch()

  const cohortPIDs: PatientId[] = useMemo(() => ['3429035' as PatientId, '3454297' as PatientId], [])

  const handlePromptChange = useCallback(
    (text: string) => {
      dispatch(setCohortExplanationPrompt(text))
    },
    [dispatch]
  )

  const handleFetchCohortExplanation = useCallback(() => {
    // Get the patient data for the cohort, remove patients, with no data
    const cohort = cohortPIDs.reduce((acc, pid) => {
      const patient = patientMap.get(pid) as Patient
      if (patient) {
        acc.push(patient)
      }
      return acc
    }, [] as Patient[])

    dispatch(
      fetchCohortExplanation({
        prompt,
        cohort,
      })
    )
  }, [dispatch, prompt, cohortPIDs, patientMap])

  return (
    <CohortPromptComponent
      value={prompt}
      onChange={handlePromptChange}
      onSubmit={handleFetchCohortExplanation}
      isLoading={state === 'loading-in-progress'}
      result={result ?? ''}
    />
  )
}

export default CohortPrompt

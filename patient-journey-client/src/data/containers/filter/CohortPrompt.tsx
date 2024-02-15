import React, { useCallback } from 'react'

import CohortPromptComponent from '../../components/filter/CohortPrompt'
import {
  useCohortExplanationPrompt,
  useCohortExplanationResult,
  useCohortExplanationState,
  usePatientCohort,
  usePatientDataRowAsMap,
} from '../../hooks'
import { useAppDispatch } from '../../../store'
import { Patient } from '../../patients'
import { fetchCohortExplanation, setCohortExplanationPrompt } from '../../dataSlice'

const CohortPrompt = () => {
  const prompt = useCohortExplanationPrompt()
  const result = useCohortExplanationResult()
  const state = useCohortExplanationState()

  const patientMap = usePatientDataRowAsMap()

  const dispatch = useAppDispatch()

  const cohortPIDs = usePatientCohort()

  const handlePromptChange = useCallback(
    (text: string) => {
      dispatch(setCohortExplanationPrompt(text))
    },
    [dispatch]
  )

  const handleFetchCohortExplanation = useCallback(() => {
    // Get the patient data for the cohort, remove patients, with no data
    const cohort = [...cohortPIDs].reduce((acc, pid) => {
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

import React, { useCallback, useEffect } from 'react'

import { useAssistant } from '../hooks'

import { Assistant as AssistantComponent } from '../components/Assistant'
import { usePatientCohort, usePatientDataRowAsMap, useSelectedEntity } from '../../data/hooks'
import { useAppDispatch } from '../../store'
import { addMessageAndRun, createNewThread } from '../assistantSlice'
import { Patient } from '../../data/patients'

export const Assistant = () => {
  const assistantState = useAssistant()
  const cohortPIDs = usePatientCohort()
  const selectedEntity = useSelectedEntity()
  const patientMap = usePatientDataRowAsMap()

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (assistantState.thread.type === 'loading-pending') {
      console.log('createNewThread')
      dispatch(createNewThread())
    }
  }, [assistantState.thread, dispatch])

  const handleSubmitMessage = useCallback(
    (message: string, useCohort: boolean, useSelectedPatient: boolean) => {
      // Get the patient data for the cohort, remove patients, with no data
      const cohort = [...cohortPIDs].reduce((acc, pid) => {
        const patient = patientMap.get(pid) as Patient
        if (patient) {
          acc.push(patient)
        }
        return acc
      }, [] as Patient[])

      const selectedPatient =
        selectedEntity && selectedEntity.type === 'patients'
          ? (patientMap.get(selectedEntity.uid) as Patient)
          : undefined

      dispatch(
        addMessageAndRun({
          prompt: message,
          cohort: useCohort ? cohort : undefined,
          selectedPatient: useSelectedPatient ? selectedPatient : undefined,
        })
      )
    },
    [dispatch, cohortPIDs, selectedEntity, patientMap]
  )

  return assistantState.thread.type === 'loading-complete' ? (
    <AssistantComponent
      messages={
        assistantState.messages.type === 'loading-complete' || assistantState.messages.type === 'loading-in-progress'
          ? assistantState.messages.messages
          : []
      }
      onSubmitMessage={handleSubmitMessage}
      cohortSize={cohortPIDs.size}
      hasSelectedPatient={selectedEntity && selectedEntity.type === 'patients'}
      isLoading={
        assistantState.messages.type === 'loading-in-progress' ||
        assistantState.run.type === 'loading-in-progress' ||
        (assistantState.run.type === 'loading-complete' && assistantState.run.status.type === 'loading-in-progress')
      }
    />
  ) : (
    <p>Loading…</p>
  )
}

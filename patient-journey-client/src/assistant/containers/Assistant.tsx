import React, { useCallback, useEffect } from 'react'

import { useAssistant } from '../hooks'

import { Assistant as AssistantComponent } from '../components/Assistant'
import { usePatientCohort, usePatientDataRowAsMap, useSelectedEntityPID } from '../../data/hooks'
import { useAppDispatch } from '../../store'
import { addMessageAndRun, createNewThread } from '../assistantSlice'
import { Patient } from '../../data/patients'
import { EntityIdNone } from '../../data/entities'

export const Assistant = () => {
  const assistantState = useAssistant()
  const cohortPIDs = usePatientCohort()
  const selectedPatientId = useSelectedEntityPID()
  const patientMap = usePatientDataRowAsMap()

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (assistantState.thread.type === 'loading-pending') {
      console.log('createNewThread')
      dispatch(createNewThread())
    }
  }, [assistantState.thread, dispatch])

  const handleCreateNewThread = useCallback(() => {
    dispatch(createNewThread())
  }, [dispatch])

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
        selectedPatientId !== EntityIdNone ? (patientMap.get(selectedPatientId) as Patient) : undefined

      dispatch(
        addMessageAndRun({
          prompt: message,
          cohort: useCohort ? cohort : undefined,
          selectedPatient: useSelectedPatient ? selectedPatient : undefined,
        })
      )
    },
    [dispatch, cohortPIDs, selectedPatientId, patientMap]
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
      hasSelectedPatient={selectedPatientId !== EntityIdNone}
      isLoading={
        assistantState.messages.type === 'loading-in-progress' ||
        assistantState.run.type === 'loading-in-progress' ||
        (assistantState.run.type === 'loading-complete' && assistantState.run.status.type === 'loading-in-progress')
      }
      hasError={
        assistantState.messages.type === 'loading-failed' ||
        assistantState.run.type === 'loading-failed' ||
        (assistantState.run.type === 'loading-complete' && assistantState.run.status.type === 'loading-failed')
      }
      onResetThread={handleCreateNewThread}
    />
  ) : assistantState.thread.type === 'loading-failed' ? (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <p>Failed to load thread… try again later.</p>
    </div>
  ) : (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <p>Loading…</p>
    </div>
  )
}

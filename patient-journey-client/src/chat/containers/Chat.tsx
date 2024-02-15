import React, { useCallback } from 'react'

import { useChat } from '../hooks'

import { Chat as ChatComponent } from '../components/Chat'
import { usePatientCohort, usePatientDataRowAsMap, useSelectedEntityPID } from '../../data/hooks'
import { useAppDispatch } from '../../store'
import { Patient } from '../../data/patients'
import { EntityIdNone } from '../../data/entities'
import { addPrompt } from '../chatSlice'

export const Chat = () => {
  const chatState = useChat()
  const cohortPIDs = usePatientCohort()
  const selectedPatientId = useSelectedEntityPID()
  const patientMap = usePatientDataRowAsMap()

  const dispatch = useAppDispatch()

  const handleSubmitMessage = useCallback(
    (message: string, useCohort: boolean, useSelectedPatient: boolean) => {
      // Get the patient data for the cohort, remove patients with no data
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
        addPrompt({
          prompt: message,
          cohort: useCohort ? cohort : undefined,
          selectedPatient: useSelectedPatient ? selectedPatient : undefined,
        })
      )
    },
    [dispatch, cohortPIDs, selectedPatientId, patientMap]
  )

  return (
    <ChatComponent
      messages={[...chatState.messages].reverse()}
      onSubmitMessage={handleSubmitMessage}
      cohortSize={cohortPIDs.size}
      hasSelectedPatient={selectedPatientId !== EntityIdNone}
      isLoading={chatState.loadingState === 'loading-in-progress'}
      hasError={chatState.loadingState === 'loading-failed'}
      onResetThread={() => {}} // TODO: Reset chat
    />
  )
}

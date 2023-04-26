import { createListenerMiddleware } from '@reduxjs/toolkit'
import { RootState } from '../store'
import { fetchPromptEmbeddings, setPromptEmbeddings, setSimilarityPrompt } from './dataSlice'
import { createPatientJourneysChunks, preparePatientJourneys } from './embeddings'

// Create the middleware instance and methods
export const listenerMiddleware = createListenerMiddleware()

// Add one or more listener entries that look for specific actions.
// They may contain any sync or async logic, similar to thunks.
listenerMiddleware.startListening({
  actionCreator: setSimilarityPrompt,
  effect: async (action, listenerApi) => {
    if (action.payload) {
      // A prompt is set, fetch prompt embeddings and add random journeys for context
      const data = (listenerApi.getState() as RootState).data

      if (data.type === 'loading-complete') {
        // Select 10 random patients from data.patientData.allEntities
        const randomPatients = [...data.patientData.allEntities].sort(() => Math.random() - Math.random()).slice(0, 10)

        const patientJourneys = preparePatientJourneys(
          { ...data.patientData, allEntities: randomPatients },
          data.eventData
        )

        const { patientJourneyChunks } = createPatientJourneysChunks(patientJourneys, 6000) // 8191 is the max number of tokens per request (but encode library does not seem to be exact)

        console.log('Resulting number of chunks for getting Prompt embeddings:', patientJourneyChunks.length)

        listenerApi.dispatch(
          fetchPromptEmbeddings({ prompt: action.payload, randomPatientJourneys: patientJourneyChunks[0] })
        )
      }
    } else {
      // No prompt, so reset prompt embeddings
      listenerApi.dispatch(setPromptEmbeddings({ type: 'loading-pending' }))
    }
  },
})

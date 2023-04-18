import { Meta, Story } from '@storybook/react'
import React from 'react'
import { LoadingProgress, Props } from '../data/components/LoadingProgress'
import { LoadingStep } from '../data/loading'
import { EMPTY_PATIENT_DATA } from '../data/patients'
import { EMPTY_EVENT_DATA } from '../data/events'

export default {
  title: 'LoadingProgress',
  component: LoadingProgress,
} as Meta

const Template: Story<Props> = (args) => <LoadingProgress {...args} />

export const StepConsistencyChecks = Template.bind({})
StepConsistencyChecks.args = {
  loadingProgress: {
    activeStep: LoadingStep.ConsistencyChecks,
    data: {
      patientData: EMPTY_PATIENT_DATA,
      eventData: EMPTY_EVENT_DATA,
      similarityData: {
        patientIdMap: {},
        indexPatientSimilarities: {
          type: 'loading-pending',
        },
      },
      embeddingsData: {
        patientDataEmbeddings: {
          type: 'loading-pending',
        },
        queryEmbeddings: {
          type: 'loading-pending',
        },
      },
    },
  },
}

import React from 'react'
import { Meta, Story } from '@storybook/react'
import { Data, Props } from '../data/components/Data'
import { EMPTY_PATIENT_DATA, PatientId } from '../data/dataSlice'

export default {
  title: 'Data',
  component: Data,
} as Meta

const Template: Story<Props> = (args) => (
  <div style={{ width: '100%', height: '200px' }}>
    <Data {...args} />
  </div>
)

export const DataLoadingPending = Template.bind({})
DataLoadingPending.args = {
  data: { type: 'loading-pending' },
}

export const DataLoadingInProgress = Template.bind({})
DataLoadingInProgress.args = {
  data: { type: 'loading-in-progress' },
}

export const DataLoadingFailed = Template.bind({})
DataLoadingFailed.args = {
  data: { type: 'loading-failed', errorMessage: 'Oops' },
}

export const DataLoadingComplete = Template.bind({})
DataLoadingComplete.args = {
  data: {
    type: 'loading-complete',
    patientData: {
      ...EMPTY_PATIENT_DATA,
      fields: ['Id', 'First Name', 'Last Name'],
      allPatients: [
        { id: '0' as PatientId, values: ['Ada', 'Lovelace'] },
        { id: '1' as PatientId, values: ['Michelle', 'Obama '] },
      ],
    },
  },
}

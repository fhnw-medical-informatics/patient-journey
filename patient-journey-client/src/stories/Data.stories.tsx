import React from 'react'
import { Meta, Story } from '@storybook/react'
import { Data, Props } from '../data/components/Data'
import { EMPTY_PATIENT_DATA, PatientId } from '../data/patients'

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
      columns: [
        { index: 0, name: 'Id', type: 'pid' },
        { index: 1, name: 'First Name', type: 'string' },
        { index: 2, name: 'Last Name', type: 'string' },
      ],
      allPatients: [
        { pid: '0' as PatientId, values: ['0', 'Ada', 'Lovelace'] },
        { pid: '1' as PatientId, values: ['1', 'Michelle', 'Obama '] },
      ],
    },
    eventData: {
      columns: [],
      allEvents: [],
    },
  },
}

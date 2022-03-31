import React from 'react'
import { Meta, Story } from '@storybook/react'
import { Data, Props } from '../data/components/Data'
import { EMPTY_PATIENT_DATA, PatientData, PatientId } from '../data/patients'
import { EMPTY_EVENT_DATA, EventData } from '../data/events'

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
      allEntities: [
        { uid: '0' as PatientId, pid: '0' as PatientId, values: ['0', 'Ada', 'Lovelace'] },
        { uid: '0' as PatientId, pid: '1' as PatientId, values: ['1', 'Michelle', 'Obama '] },
      ],
    } as PatientData,
    eventData: {
      ...EMPTY_EVENT_DATA,
      columns: [],
      allEntities: [],
    } as EventData,
    filters: [],
    view: 'patients',
  },
}

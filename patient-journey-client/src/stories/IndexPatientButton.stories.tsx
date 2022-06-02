import { Meta, Story } from '@storybook/react'
import React from 'react'
import { PatientId } from '../data/patients'
import { IndexPatientButton, IndexPatientButtonProps } from '../table/components/IndexPatientButton'

export default {
  title: 'IndexPatientButton',
  component: IndexPatientButton,
} as Meta

const Template: Story<IndexPatientButtonProps> = (args) => <IndexPatientButton {...args} />

export const IndexPatientButtonDefault = Template.bind({})
IndexPatientButtonDefault.args = {
  patientId: '123' as PatientId,
}

export const IndexPatientButtonSelected = Template.bind({})
IndexPatientButtonSelected.args = {
  patientId: '123' as PatientId,
  indexPatientId: '123' as PatientId,
}

export const IndexPatientButtonLoading = Template.bind({})
IndexPatientButtonLoading.args = {
  patientId: '123' as PatientId,
  indexPatientId: '123' as PatientId,
  isLoading: true,
}

export const IndexPatientButtonLoadingOther = Template.bind({})
IndexPatientButtonLoadingOther.args = {
  patientId: '123' as PatientId,
  indexPatientId: '124' as PatientId,
  isLoading: true,
}

export const IndexPatientButtonError = Template.bind({})
IndexPatientButtonError.args = {
  patientId: '123' as PatientId,
  indexPatientId: '124' as PatientId,
  isLoading: false,
  error: 'Could not load similarities for index patient',
}

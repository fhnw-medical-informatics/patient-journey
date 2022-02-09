import React from 'react'
import { Meta, Story } from '@storybook/react'
import { Data, Props } from '../data/components/Data'

export default {
  title: 'Data',
  component: Data,
} as Meta

const Template: Story<Props> = (args) => <Data {...args} />

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
  data: { type: 'loading-complete', patients: { columns: [''], rows: [''] } },
}

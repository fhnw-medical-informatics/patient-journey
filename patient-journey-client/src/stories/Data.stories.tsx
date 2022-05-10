import React from 'react'

import { Meta, Story } from '@storybook/react'
import { Data, Props } from '../data/components/Data'

export default {
  title: 'Data',
  component: Data,
} as Meta

const Template: Story<Props> = (args) => (
  <div style={{ width: '100%', height: '200px' }}>
    <Data {...args}>
      <div>Loading Complete</div>
    </Data>
  </div>
)

export const DataLoadingPending = Template.bind({})
DataLoadingPending.args = {
  type: 'loading-pending',
  errorMessage: '',
}

export const DataLoadingInProgress = Template.bind({})
DataLoadingInProgress.args = {
  type: 'loading-in-progress',
  errorMessage: '',
}

export const DataLoadingFailed = Template.bind({})
DataLoadingFailed.args = {
  type: 'loading-failed',
  errorMessage: 'Oops',
}

export const DataLoadingComplete = Template.bind({})
DataLoadingComplete.args = {
  type: 'loading-complete',
}

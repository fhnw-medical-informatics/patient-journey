import { Meta, Story } from '@storybook/react'
import React from 'react'
import { LoadingProgress, Props } from '../data/components/LoadingProgress'
import { LoadingStep } from '../data/loading'

export default {
  title: 'LoadingProgress',
  component: LoadingProgress,
} as Meta

const Template: Story<Props> = (args) => <LoadingProgress {...args} />

export const StepConsistencyChecks = Template.bind({})
StepConsistencyChecks.args = { activeStep: LoadingStep.ConsistencyChecks }

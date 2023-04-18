import React from 'react'
import { makeStyles } from '../../utils'
import { CircularProgress, Step, StepIcon, StepIconProps, StepLabel, Stepper } from '@mui/material'
import { LoadingProgress as LoadingProgressState, LoadingStep } from '../loading'
import { ConsistencyChecks } from '../containers/ConsistencyChecks'

const STEPS = [
  'Loading Patients',
  'Loading Events',
  'Loading Similarities',
  'Loading Embeddings',
  'Checking Consistency',
]

const useStyles = makeStyles()((theme) => ({
  centered: {
    width: '100%',
    height: '100%',
    display: 'grid',
    alignItems: 'center',
    alignContent: 'center',
    justifyItems: 'center',
  },
  label: {
    paddingTop: theme.spacing(2),
  },
}))

export interface Props {
  readonly loadingProgress: LoadingProgressState
}

export const LoadingProgress = ({ loadingProgress }: Props) => {
  const { classes } = useStyles()
  const { activeStep } = loadingProgress
  return (
    <div className={classes.centered}>
      <Stepper activeStep={activeStep} orientation={'vertical'}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel StepIconComponent={CustomStepIcon}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {activeStep === LoadingStep.ConsistencyChecks && <ConsistencyChecks data={loadingProgress.data} />}
    </div>
  )
}

const CustomStepIcon = (props: StepIconProps) => {
  return props.active ? <CircularProgress size={24} disableShrink={true} /> : <StepIcon {...props} />
}

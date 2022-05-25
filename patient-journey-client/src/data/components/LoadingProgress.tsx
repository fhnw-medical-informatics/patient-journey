import React from 'react'
import { makeStyles } from '../../utils'
import { CircularProgress, Step, StepIcon, StepIconProps, StepLabel, Stepper } from '@mui/material'
import { LoadingStep } from '../dataSlice'

const STEPS = ['Loading Patients', 'Loading Events', 'Loading Similarities', 'Checking Consistency']

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

interface Props {
  readonly activeStep: LoadingStep
}

export const LoadingProgress = ({ activeStep }: Props) => {
  const { classes } = useStyles()
  return (
    <div className={classes.centered}>
      <Stepper activeStep={activeStep} orientation={'vertical'}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel StepIconComponent={CustomStepIcon}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </div>
  )
}

const CustomStepIcon = (props: StepIconProps) => {
  return props.active ? <CircularProgress size={24} disableShrink={true} /> : <StepIcon {...props} />
}

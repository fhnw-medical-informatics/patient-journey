import React from 'react'
import { makeStyles } from '../../utils'
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Step,
  StepIcon,
  StepIconProps,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material'
import { LoadingStep } from '../loading'

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

export interface Props {
  readonly activeStep: LoadingStep
  readonly onSkipPressed: () => void
}

export const LoadingProgress = ({ activeStep, onSkipPressed }: Props) => {
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
      {activeStep === LoadingStep.ConsistencyChecks && <SkipConsistencyChecksInfo onSkipPressed={onSkipPressed} />}
    </div>
  )
}

const CustomStepIcon = (props: StepIconProps) => {
  return props.active ? <CircularProgress size={24} disableShrink={true} /> : <StepIcon {...props} />
}

interface SkipConsistencyChecksInfoProps {
  readonly onSkipPressed: () => void
}

const SkipConsistencyChecksInfo = ({ onSkipPressed }: SkipConsistencyChecksInfoProps) => (
  <Card raised={true} sx={{ mt: 3, maxWidth: 400 }}>
    <CardContent>
      <Typography variant={'button'} color="text.secondary">
        {'Taking too long?'}
      </Typography>
      <Typography sx={{ mt: 1 }} variant={'body2'}>
        {'If you have previously loaded and checked your data, you can safely skip this last step.'}
      </Typography>
    </CardContent>
    <CardActions sx={{ justifyContent: 'end' }}>
      <Button size="small" onClick={onSkipPressed}>
        {'Skip Checks'}
      </Button>
    </CardActions>
  </Card>
)

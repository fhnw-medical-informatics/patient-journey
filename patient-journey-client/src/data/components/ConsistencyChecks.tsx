import { Button, Card, CardActions, CardContent, Typography } from '@mui/material'
import React from 'react'
import { makeStyles } from '../../utils'

const useStyles = makeStyles()((theme) => ({
  card: {
    marginTop: theme.spacing(3),
    maxWidth: 400,
  },
  text: {
    marginTop: theme.spacing(1),
  },
  actions: {
    justifyContent: 'end',
  },
}))

interface Props {
  readonly onSkipPressed: () => void
}

export const ConsistencyChecks = ({ onSkipPressed }: Props) => {
  const { classes } = useStyles()
  return (
    <Card className={classes.card} raised={true}>
      <CardContent>
        <Typography variant={'button'} color="text.secondary">
          {'Taking too long?'}
        </Typography>
        <Typography className={classes.text} variant={'body2'}>
          {'If you have previously loaded and checked your data, you can safely skip this last step.'}
        </Typography>
      </CardContent>
      <CardActions className={classes.actions}>
        <Button size="small" onClick={onSkipPressed}>
          {'Skip Checks'}
        </Button>
      </CardActions>
    </Card>
  )
}

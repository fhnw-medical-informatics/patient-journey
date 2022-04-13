import { Card, Grid } from '@mui/material'
import React from 'react'
import { makeStyles } from '../../utils'
import { ColorLegend } from '../../color/containers/ColorLegend'

const useStyles = makeStyles()({
  root: {
    display: 'grid',
    width: '100%',
    height: '100%',
  },
})

export const DataLegend = () => {
  const { classes } = useStyles()
  return (
    <Card className={classes.root}>
      <Grid container direction={'row'} alignItems={'center'} padding={1}>
        <Grid item xs>
          <ColorLegend />
        </Grid>
      </Grid>
    </Card>
  )
}

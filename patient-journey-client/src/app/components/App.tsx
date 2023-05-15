import React from 'react'

import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import { Typography } from '@mui/material'

import logo from './fhnw-logo.png'

import { makeStyles } from '../../utils'
import { ThemeSwitch } from '../../theme/containers/ThemeSwitch'

import { Data } from '../../data/containers/Data'
import { Alerts } from '../../alert/containers/Alerts'
import { DataViewSelector } from '../../data/containers/DataViewSelector'
import SimilarityProviderSelector from '../../data/containers/SimilarityProviderSelector'
import { CohortToolbarItem } from '../../data/containers/cohort/CohortToolbarItem'

const useStyles = makeStyles()((theme) => ({
  app: {
    height: `100vh`,
    width: '100vw',
    display: 'grid',
    gridTemplateRows: `64px 1fr`,
  },
  appBar: {
    position: 'relative', // override MUI fixed
  },
  toolbar: {
    display: 'grid',
    gridTemplateColumns: 'auto auto auto 1fr auto auto',
    justifyItems: 'start',
    gridGap: theme.spacing(2),
  },
  logo: {
    height: 40,
    justifySelf: 'start',
  },
  title: {
    // centered on page (rather than in flow of toolbar items)
    position: 'absolute',
    width: '100%',
    display: 'grid',
    justifyItems: 'center',
    pointerEvents: 'none',
  },
  main: {
    height: '100%',
    width: '100%',
    position: 'relative',
  },
}))

interface Props {
  readonly isLoadingComplete: boolean
}

export const App = ({ isLoadingComplete }: Props) => {
  const { classes } = useStyles()

  return (
    <div className={classes.app}>
      <AppBar className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <img className={classes.logo} src={logo} alt={'Fachhochschule Nordwestschweiz'} />
          {isLoadingComplete ? <DataViewSelector /> : <div />}
          {isLoadingComplete ? <CohortToolbarItem /> : <div />}
          {isLoadingComplete ? <SimilarityProviderSelector /> : <div />}
          <Typography className={classes.title}>{`Patient Journey – v${import.meta.env.VITE_APP_VERSION}`}</Typography>
          <Alerts />
          <ThemeSwitch />
        </Toolbar>
      </AppBar>
      <div className={classes.main}>
        <Data />
      </div>
    </div>
  )
}

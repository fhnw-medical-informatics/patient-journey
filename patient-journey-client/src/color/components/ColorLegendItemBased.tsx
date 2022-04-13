import { Theme } from '@mui/material'
import React from 'react'
import { makeStyles } from '../../utils'
import { COLOR_LEGEND_SIZE } from './shared'

const useStyles = makeStyles()((theme: Theme) => ({
  root: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
  },
  item: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    alignItems: 'center',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  colorCell: {
    height: COLOR_LEGEND_SIZE,
    width: COLOR_LEGEND_SIZE,
    marginRight: theme.spacing(0.5),
  },
}))

export interface ColorLegendItem {
  readonly color: string
  readonly label: string
}

interface Props {
  readonly items: ReadonlyArray<ColorLegendItem>
}

export const ColorLegendItemBased = ({ items }: Props) => {
  const { classes } = useStyles()
  return (
    <div className={classes.root}>
      {items.map((item, index) => (
        <div key={index} className={classes.item}>
          <div className={classes.colorCell} style={{ backgroundColor: item.color }} />
          <div>{item.label}</div>
        </div>
      ))}
    </div>
  )
}

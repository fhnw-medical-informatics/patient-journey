import React from 'react'
import { BarTooltipProps, BarDatum } from '@nivo/bar'

import { makeStyles } from '../../../utils'

const useStyles = makeStyles()((theme) => ({
  tooltipText: {
    color: theme.palette.text.primary,
    fontSize: '12px',
  },
}))

interface ToolTipProps extends BarTooltipProps<BarDatum> {
  children: (node: any) => React.ReactNode
}

export const Tooltip = ({ data, children, ...rest }: ToolTipProps) => {
  const { classes } = useStyles()

  return <div className={classes.tooltipText}>{children(data)}</div>
}

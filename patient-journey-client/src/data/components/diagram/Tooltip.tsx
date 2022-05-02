import React from 'react'
import { makeStyles } from '../../../utils'

const useStyles = makeStyles()((theme) => ({
  tooltipContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
  },
  tooltipText: {
    color: theme.palette.text.primary,
    fontSize: '12px',
  },
}))

interface TooltipProps {
  text: string
  color: string
}

export const Tooltip = ({ text, color }: TooltipProps) => {
  const { classes } = useStyles()
  return (
    <div className={classes.tooltipContainer}>
      <div style={{ backgroundColor: color, width: '10px', height: '10px', marginRight: '5px' }} />
      <div className={classes.tooltipText}>{text}</div>
    </div>
  )
}

export default Tooltip

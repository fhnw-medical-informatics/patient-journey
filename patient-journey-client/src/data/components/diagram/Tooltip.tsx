import { scaleLinear } from 'd3-scale'
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
  index: number
  total: number
}

export const Tooltip = ({ text, color, index, total = 10 }: TooltipProps) => {
  const { classes } = useStyles()

  const positionScale = scaleLinear().domain([0, total]).range([45, -45])

  return (
    <div className={classes.tooltipContainer} style={{ transform: `translate(${positionScale(index)}%)` }}>
      <div style={{ backgroundColor: color, width: '10px', height: '10px', marginRight: '5px' }} />
      <div className={classes.tooltipText}>{text}</div>
    </div>
  )
}

export default Tooltip

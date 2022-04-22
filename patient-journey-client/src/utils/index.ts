import { createMakeAndWithStyles } from 'tss-react'
import { useTheme } from '@mui/material'
export const { makeStyles, withStyles } = createMakeAndWithStyles({ useTheme })
export const noOp = () => {}
export const diff = (value1: number, value2: number): number => {
  return Math.abs(Math.max(value1, value2) - Math.min(value1, value2))
}

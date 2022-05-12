import React from 'react'
import { useTheme } from '@mui/material'

interface Props {
  readonly color: string
}

export const ColoredCircle = ({ color }: Props) => {
  const theme = useTheme()
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: color,
          border: `2px solid ${theme.palette.common.white}`,
        }}
      />
    </div>
  )
}

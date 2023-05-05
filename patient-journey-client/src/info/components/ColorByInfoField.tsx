import { InputAdornment, TextField } from '@mui/material'
import { ColoredCircle } from '../../color/components/ColoredCircle'
import { ColorByInfo, ColorByInfoNone } from '../../color/hooks'
import React from 'react'

interface Props {
  readonly colorByInfo: ColorByInfo
}

export const ColorByInfoField = ({ colorByInfo }: Props) => {
  if (colorByInfo === ColorByInfoNone) {
    return null
  } else {
    return (
      <TextField
        size={'small'}
        label={colorByInfo.columnName}
        value={colorByInfo.formattedValue}
        InputProps={{
          readOnly: true,
          startAdornment: (
            <InputAdornment position="start">
              <ColoredCircle color={colorByInfo.color} />
            </InputAdornment>
          ),
        }}
      />
    )
  }
}

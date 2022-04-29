import React from 'react'

import { SliderThumb, styled } from '@mui/material'
import LabelIcon from '@mui/icons-material/Label'

const StyledSlider = styled(SliderThumb)(({ theme }) => ({
  height: 10,
  width: 10,
  backgroundColor: 'transparent',
  top: 10,
  '& .MuiSlider-valueLabel': {
    top: -20,
  },
}))

interface CustomliderThumbProps extends React.HTMLAttributes<unknown> {}

export const CustomSliderThumb = (props: CustomliderThumbProps) => {
  const { children, ...other } = props

  return (
    <StyledSlider {...other}>
      {children}
      <LabelIcon fontSize="small" sx={{ transform: 'rotate(-90deg)' }} />
    </StyledSlider>
  )
}

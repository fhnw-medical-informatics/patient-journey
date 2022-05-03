import React, { useCallback, useEffect, useState } from 'react'
import { Slider, styled, SliderProps } from '@mui/material'
import { debounce } from 'lodash'

export const StyledSlider = styled(Slider)(() => ({
  padding: 0,
  marginBottom: 30,
}))

export const CustomSlider = (props: SliderProps) => {
  const { children, value, onChange, ...other } = props

  const [localState, setLocalState] = useState(value)

  useEffect(() => {
    setLocalState(value)
  }, [value, setLocalState])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedOnChange = useCallback(
    debounce(
      (event: Event, value: number | number[], activeThumb: number) => onChange && onChange(event, value, activeThumb),
      150
    ),
    [onChange]
  )

  const localOnChange = useCallback(
    (event: Event, value: number | number[], activeThumb: number) => {
      setLocalState(value)
      debouncedOnChange(event, value, activeThumb)
    },
    [debouncedOnChange, setLocalState]
  )

  return (
    <StyledSlider {...other} value={localState} onChange={localOnChange}>
      {children}
    </StyledSlider>
  )
}

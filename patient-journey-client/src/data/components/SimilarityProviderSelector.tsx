import React from 'react'
import { Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from '@mui/material'

import { SimilarityProvider } from '../dataSlice'

export interface Option {
  label: string
  value: SimilarityProvider
}

interface SimilarityProviderSelectorProps {
  options: Option[]
  selectedOption: SimilarityProvider
  onChange: (value: SimilarityProvider) => void
  show?: boolean
}

const SimilarityProviderSelector: React.FC<SimilarityProviderSelectorProps> = ({
  options,
  selectedOption,
  onChange,
  show = true,
}) => {
  const handleSelectionChange = (event: SelectChangeEvent) => {
    onChange(event.target.value as SimilarityProvider)
  }

  return show ? (
    <FormControl variant="outlined" size="small">
      <InputLabel htmlFor="select-dropdown">Similarity provider</InputLabel>
      <Select id="select-dropdown" value={selectedOption} onChange={handleSelectionChange} label="Similarity provider">
        {options.map((option: Option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  ) : (
    <div />
  )
}

export default SimilarityProviderSelector

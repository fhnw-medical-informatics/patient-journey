import { Box } from '@mui/material'
import React from 'react'

export const NoMatchesPlaceholder = () => (
  <Box fontStyle="italic" textAlign={'center'}>
    {'No data (or no filter matches)'}
  </Box>
)

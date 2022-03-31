import { Theme } from '@mui/material'
import { grey } from '@mui/material/colors'

export const barColors = (theme: Theme) => [
  theme.palette.primary.main,
  theme.palette.mode === 'light' ? grey[200] : grey[800],
]

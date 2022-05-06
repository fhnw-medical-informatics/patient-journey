import { createTheme, Theme } from '@mui/material'
import { useAppSelector } from '../store'
import { deepPurple, yellow, grey } from '@mui/material/colors'
import { AppTheme } from './themeSlice'

declare module '@mui/material/styles' {
  interface Theme {
    entityColors: {
      default: string
      filteredOut: string
      selected: string
    }
  }

  // allow configuration using `createTheme`
  // noinspection JSUnusedGlobalSymbols
  interface ThemeOptions {
    entityColors?: {
      default?: string
      filteredOut?: string
      selected?: string
    }
  }
}

const createCustomTheme = (mode: AppTheme, selectionColor: string, defaultColor: string) =>
  createTheme({
    palette: {
      mode,
      background: {
        default: mode === 'light' ? grey[100] : grey[800],
      },
    },
    entityColors: {
      default: defaultColor,
      filteredOut: mode === 'light' ? grey[100] : grey[900],
      selected: selectionColor,
    },
    components: {
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&.MuiTableRow-hover': {
              '&:hover': {
                backgroundColor: selectionColor,
              },
            },
            '&.Mui-selected': {
              backgroundColor: selectionColor,
            },
          },
        },
      },
    },
  })

const LIGHT_SELECTION_COLOR = yellow[200]
const DARK_SELECTION_COLOR = deepPurple[400]

const LIGHT_DEFAULT_COLOR = grey[300]
const DARK_DEFAULT_COLOR = grey[400]

export const lightTheme = createCustomTheme('light', LIGHT_SELECTION_COLOR, LIGHT_DEFAULT_COLOR)
export const darkTheme = createCustomTheme('dark', DARK_SELECTION_COLOR, DARK_DEFAULT_COLOR)

export const useCustomTheme = () =>
  useAppSelector<Theme>((s) => {
    return s.theme === 'light' ? lightTheme : darkTheme
  })

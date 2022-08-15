import { createTheme, Theme } from '@mui/material'
import { useAppSelector } from '../store'
import { deepPurple, yellow, grey, pink } from '@mui/material/colors'
import { AppTheme } from './themeSlice'

declare module '@mui/material/styles' {
  interface Theme {
    entityColors: {
      default: string
      filteredOut: string
      selected: string
      indexPatient: string
      stroke: string
      journeyStroke: string
    }
  }

  // allow configuration using `createTheme`
  // noinspection JSUnusedGlobalSymbols
  interface ThemeOptions {
    entityColors?: {
      default?: string
      filteredOut?: string
      selected?: string
      indexPatient?: string
      stroke?: string
      journeyStroke?: string
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
      filteredOut: mode === 'light' ? grey[200] : grey[700],
      selected: selectionColor,
      indexPatient: mode === 'light' ? pink[600] : yellow[700],
      journeyStroke: selectionColor,
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

const LIGHT_SELECTION_COLOR = yellow[400]
const DARK_SELECTION_COLOR = deepPurple[400]

const LIGHT_DEFAULT_COLOR = grey[400]
const DARK_DEFAULT_COLOR = grey[400]

export const lightTheme = createCustomTheme('light', LIGHT_SELECTION_COLOR, LIGHT_DEFAULT_COLOR)
export const darkTheme = createCustomTheme('dark', DARK_SELECTION_COLOR, DARK_DEFAULT_COLOR)

export const useCustomTheme = () =>
  useAppSelector<Theme>((s) => {
    return s.theme === 'light' ? lightTheme : darkTheme
  })

export const LIGHTENING_FACTOR = 0.6
export const DARKENING_FACTOR = 0.6

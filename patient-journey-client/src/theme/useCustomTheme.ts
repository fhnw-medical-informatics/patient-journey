import { createTheme, Theme } from '@mui/material'
import { useAppSelector } from '../store'
import { deepPurple, yellow } from '@mui/material/colors'
import { AppTheme } from './themeSlice'

declare module '@mui/material/styles' {
  interface Theme {
    entityColors: {
      selected: string
    }
  }

  // allow configuration using `createTheme`
  // noinspection JSUnusedGlobalSymbols
  interface ThemeOptions {
    entityColors?: {
      selected?: string
    }
  }
}

const createCustomTheme = (mode: AppTheme, selectionColor: string) =>
  createTheme({
    palette: {
      mode,
    },
    entityColors: {
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

const lightTheme = createCustomTheme('light', LIGHT_SELECTION_COLOR)
const darkTheme = createCustomTheme('dark', DARK_SELECTION_COLOR)

export const useCustomTheme = () =>
  useAppSelector<Theme>((s) => {
    return s.theme === 'light' ? lightTheme : darkTheme
  })

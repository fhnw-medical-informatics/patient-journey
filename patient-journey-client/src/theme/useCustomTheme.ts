import { alpha, createTheme, Theme } from '@mui/material'
import { useAppSelector } from '../store'
import { deepPurple, yellow } from '@mui/material/colors'

declare module '@mui/material/styles' {
  interface Theme {
    entityColors: {
      selected: string
      hovered: string
    }
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    entityColors?: {
      selected?: string
      hovered?: string
    }
  }
}

const LIGHT_SELECTED_COLOR = yellow[200]
const LIGHT_HOVERED_COLOR = alpha(LIGHT_SELECTED_COLOR, 0.5)

const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
  entityColors: {
    selected: LIGHT_SELECTED_COLOR,
    hovered: LIGHT_HOVERED_COLOR,
  },
  components: {
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&.MuiTableRow-hover': {
            '&:hover': {
              backgroundColor: LIGHT_HOVERED_COLOR,
            },
          },
          '&.Mui-selected': {
            backgroundColor: LIGHT_SELECTED_COLOR,
          },
        },
      },
    },
  },
})

const DARK_SELECTED_COLOR = deepPurple[400]
const DARK_HOVERED_COLOR = alpha(DARK_SELECTED_COLOR, 0.5)

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
  entityColors: {
    selected: DARK_SELECTED_COLOR,
    hovered: DARK_HOVERED_COLOR,
  },
  components: {
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&.MuiTableRow-hover': {
            '&:hover': {
              backgroundColor: DARK_HOVERED_COLOR,
            },
          },
          '&.Mui-selected': {
            backgroundColor: DARK_SELECTED_COLOR,
          },
        },
      },
    },
  },
})

export const useCustomTheme = () =>
  useAppSelector<Theme>((s) => {
    return s.theme === 'light' ? lightTheme : darkTheme
  })

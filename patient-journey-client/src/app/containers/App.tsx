import { App as AppComponent } from '../components/App'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import { ThemeProvider } from '@mui/material/styles'
import { useCustomTheme } from '../../theme'
import { CssBaseline } from '@mui/material'
import { useAppDispatch } from '../../store'
import { useEffect } from 'react'
import { loadData } from '../../data/dataSlice'

export const muiCache = createCache({
  key: 'mui',
  prepend: true,
})

export const App = () => {
  // This is the only explicit access to our custom theme
  // From here on, it is safe and convenient to use the `useTheme` hook
  const theme = useCustomTheme()

  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(loadData())
  }, [dispatch])

  return (
    <CacheProvider value={muiCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppComponent />
      </ThemeProvider>
    </CacheProvider>
  )
}

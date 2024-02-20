import { useEffect } from 'react'
import { App as AppComponent } from '../components/App'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import { ThemeProvider } from '@mui/material/styles'
import { useCustomTheme } from '../../theme/useCustomTheme'
import { CssBaseline } from '@mui/material'
import { useAppDispatch } from '../../store'
import { loadData } from '../../data/dataSlice'
import { useDataLoadingState } from '../../data/hooks'

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

  const loadingState = useDataLoadingState()

  return (
    <CacheProvider value={muiCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <AppComponent isLoadingComplete={loadingState === 'loading-complete'} />
      </ThemeProvider>
    </CacheProvider>
  )
}

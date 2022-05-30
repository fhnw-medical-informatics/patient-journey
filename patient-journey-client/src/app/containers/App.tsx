import { useEffect } from 'react'
import { browserName } from 'react-device-detect'
import { App as AppComponent } from '../components/App'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import { ThemeProvider } from '@mui/material/styles'
import { useCustomTheme } from '../../theme/useCustomTheme'
import { Alert, CssBaseline, Grid } from '@mui/material'
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
        <CssBaseline />
        {import.meta.env.DEV && browserName !== 'Chrome' ? (
          <Grid container justifyContent="center">
            <Grid item xs="auto" sx={{ padding: theme.spacing(4) }}>
              <Alert severity="error">
                You must use Chrome for development now 🥲.
                <br />
                Import statements in Web Workers are not supported natively in {browserName} (No worries, production
                builds will work fine)
                <br />
                <br />
                For more information, check:{' '}
                <a href="https://vitejs.dev/guide/features.html#import-with-query-suffixes">
                  https://vitejs.dev/guide/features.html#import-with-query-suffixes
                </a>
              </Alert>
            </Grid>
          </Grid>
        ) : (
          <AppComponent isLoadingComplete={loadingState === 'loading-complete'} />
        )}
      </ThemeProvider>
    </CacheProvider>
  )
}

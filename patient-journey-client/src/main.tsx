import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/containers/App'
import { Provider } from 'react-redux'
import { store } from './store'

const Root = () => (
  <Provider store={store}>
    <App />
  </Provider>
)

const container = document.getElementById('root')
const root = createRoot(container!)

root.render(<Root />)

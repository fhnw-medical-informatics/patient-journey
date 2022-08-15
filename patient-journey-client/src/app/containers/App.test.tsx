import { render, screen } from '../../test/test-utils'
import { Provider } from 'react-redux'
import { App } from './App'
import { store } from '../../store'

beforeAll(() => {
  // data loading will fail due to mocked 'fetch'
  console.error = jest.fn()
})

it('renders without crashing', () => {
  const Root = () => (
    <Provider store={store}>
      <App />
    </Provider>
  )
  render(<Root />)
  expect(screen.getByText(/You must use Chrome/)).toBeInTheDocument()
})

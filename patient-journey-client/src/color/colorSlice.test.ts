import { colorReducer, setColorByColumn } from './colorSlice'

describe('colorSlice', () => {
  it(`should handle ${setColorByColumn.type} action`, () => {
    expect(
      colorReducer(
        { column: 'off', type: 'none' },
        setColorByColumn({ column: { name: 'Test', type: 'number', index: 0 }, type: 'patients' })
      )
    ).toEqual({
      type: 'patients',
      column: { name: 'Test', type: 'number', index: 0 },
    })
  })
})

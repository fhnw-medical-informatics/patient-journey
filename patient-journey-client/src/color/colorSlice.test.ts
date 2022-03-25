import { colorReducer, setColorByColumn } from './colorSlice'

describe('colorSlice', () => {
  it(`should handle ${setColorByColumn.type} action`, () => {
    expect(
      colorReducer(
        { colorByColumn: 'off' },
        setColorByColumn({ colorByColumn: { name: 'Test', type: 'number', index: 0 } })
      )
    ).toEqual({
      colorByColumn: { name: 'Test', type: 'number', index: 0 },
    })
  })
})

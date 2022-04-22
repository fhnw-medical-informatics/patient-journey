import {
  setViewByColumn,
  setExpandByColumn,
  setTimelineCluster,
  setCursorPosition,
  resetCursorPosition,
  TimelineColumnNone,
  TimelineColumn,
  CursorPositionNone,
  CursorPosition,
} from './timelineSlice'

import { createStore } from '../store'

describe('Timeline Slice', () => {
  it('handles setViewByColumn action', async () => {
    const store = createStore()

    const getViewByColumn = () => store.getState().timeline.viewByColumn

    expect(getViewByColumn()).toEqual(TimelineColumnNone)

    const testColumn: TimelineColumn = {
      name: 'Col_1',
      type: 'string',
      index: 0,
    }

    store.dispatch(setViewByColumn(testColumn))
    expect(getViewByColumn()).toEqual(testColumn)
  })

  it('handles setExpandByColumn action', async () => {
    const store = createStore()

    const getExpandByColumn = () => store.getState().timeline.expandByColumn

    expect(getExpandByColumn()).toEqual(TimelineColumnNone)

    const testColumn: TimelineColumn = {
      name: 'Col_1',
      type: 'string',
      index: 0,
    }

    store.dispatch(setExpandByColumn(testColumn))
    expect(getExpandByColumn()).toEqual(testColumn)
  })

  it('handles setTimelineCluster action', async () => {
    const store = createStore()

    const getCluster = () => store.getState().timeline.cluster

    expect(getCluster()).toEqual(true)

    store.dispatch(setTimelineCluster())
    expect(getCluster()).toEqual(false)
  })

  it('handles setCursorPosition action', async () => {
    const store = createStore()

    const getCursorPosition = () => store.getState().timeline.cursorPosition

    expect(getCursorPosition()).toEqual(CursorPositionNone)

    const testPosition: CursorPosition = {
      x: 1,
      y: 2,
    }

    store.dispatch(setCursorPosition(testPosition))
    expect(getCursorPosition()).toEqual(testPosition)
  })

  it('handles resetCursorPosition action', async () => {
    const store = createStore()

    const getCursorPosition = () => store.getState().timeline.cursorPosition

    expect(getCursorPosition()).toEqual(CursorPositionNone)

    const testPosition: CursorPosition = {
      x: 1,
      y: 2,
    }

    store.dispatch(setCursorPosition(testPosition))
    expect(getCursorPosition()).toEqual(testPosition)

    store.dispatch(resetCursorPosition())
    expect(getCursorPosition()).toEqual(CursorPositionNone)
  })
})

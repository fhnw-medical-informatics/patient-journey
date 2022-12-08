import {
  setViewByColumn,
  setExpandByColumn,
  setSortByColumn,
  setTimelineCluster,
  setCursorPosition,
  resetCursorPosition,
  TimelineColumnNone,
  TimelineColumn,
  CursorPositionNone,
  CursorPosition,
  toggleTimeGrid,
  setShowFilteredOut,
  toggleAllowInteraction,
} from './timelineSlice'

import { createStore } from '../store'
import { selectShowTimeGrid } from './selectors'

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

  it('resets sortByColumn, when setExpandByColumn action is called', async () => {
    const store = createStore()

    const getExpandByColumn = () => store.getState().timeline.expandByColumn
    const getSortByColumn = () => store.getState().timeline.sortByColumn

    expect(getExpandByColumn()).toEqual(TimelineColumnNone)
    expect(getSortByColumn()).toEqual(TimelineColumnNone)

    const testColumn: TimelineColumn = {
      name: 'Col_1',
      type: 'string',
      index: 0,
    }

    store.dispatch(setExpandByColumn(testColumn))
    store.dispatch(setSortByColumn(testColumn))
    expect(getExpandByColumn()).toEqual(testColumn)
    expect(getSortByColumn()).toEqual(testColumn)

    store.dispatch(setExpandByColumn(TimelineColumnNone))
    expect(getExpandByColumn()).toEqual(TimelineColumnNone)
    expect(getSortByColumn()).toEqual(TimelineColumnNone)
  })

  it('handles setSortByColumn action', async () => {
    const store = createStore()

    const getSortByColumn = () => store.getState().timeline.sortByColumn

    expect(getSortByColumn()).toEqual(TimelineColumnNone)

    const testColumn: TimelineColumn = {
      name: 'Col_1',
      type: 'string',
      index: 0,
    }

    store.dispatch(setExpandByColumn(testColumn))
    store.dispatch(setSortByColumn(testColumn))
    expect(getSortByColumn()).toEqual(testColumn)
  })

  it('only sets sortByColumn, when expandByColumn is set', async () => {
    const store = createStore()

    const getSortByColumn = () => store.getState().timeline.sortByColumn

    expect(getSortByColumn()).toEqual(TimelineColumnNone)

    const testColumn: TimelineColumn = {
      name: 'Col_1',
      type: 'string',
      index: 0,
    }

    store.dispatch(setSortByColumn(testColumn))
    expect(getSortByColumn()).toEqual(TimelineColumnNone)
  })

  it('handles setTimelineCluster action', async () => {
    const store = createStore()

    const getCluster = () => store.getState().timeline.cluster

    expect(getCluster()).toEqual(true)

    store.dispatch(setTimelineCluster())
    expect(getCluster()).toEqual(false)
  })

  it('handles setShowFilteredOut action', async () => {
    const store = createStore()

    const selectShowFilteredOut = () => store.getState().timeline.showFilteredOut

    expect(selectShowFilteredOut()).toEqual(false)

    store.dispatch(setShowFilteredOut())
    expect(selectShowFilteredOut()).toEqual(true)
  })

  it(`handles ${toggleTimeGrid} action`, async () => {
    const store = createStore()
    const getShowTimeGrid = () => selectShowTimeGrid(store.getState())
    expect(getShowTimeGrid()).toEqual(true)
    store.dispatch(toggleTimeGrid())
    expect(getShowTimeGrid()).toEqual(false)
  })

  it(`handles ${toggleAllowInteraction} action`, async () => {
    const store = createStore()
    const getAllowInteraction = () => store.getState().timeline.allowInteraction
    expect(getAllowInteraction()).toEqual(false)
    store.dispatch(toggleAllowInteraction())
    expect(getAllowInteraction()).toEqual(true)
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

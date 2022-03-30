import {
  setViewByColumn,
  setExpandByColumn,
  setTimelineCluster,
  TimelineColumnNone,
  TimelineColumn,
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
})

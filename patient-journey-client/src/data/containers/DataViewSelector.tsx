import React from 'react'

import { useAppDispatch } from '../../store'
import { ActiveDataViewType, setDataView } from '../dataSlice'

import { useActiveDataView } from '../hooks'

import { DataViewSelector as DataViewSelectorComponent } from '../components/DataViewSelector'

export const DataViewSelector = () => {
  const activeDataView = useActiveDataView()
  const dispatch = useAppDispatch()

  const handleActiveDataViewChange = (view: ActiveDataViewType) => {
    dispatch(setDataView(view))
  }

  return <DataViewSelectorComponent activeDataView={activeDataView} onChangeDataView={handleActiveDataViewChange} />
}

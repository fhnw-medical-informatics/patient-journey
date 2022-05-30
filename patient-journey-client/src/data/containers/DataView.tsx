import React, { useCallback } from 'react'
import { useAppDispatch } from '../../store'

import { DataView as DataViewComponent } from '../components/DataView'
import { setSplitPaneResizing } from '../dataSlice'

export const DataView = () => {
  const dispatch = useAppDispatch()

  const onResizeStart = useCallback(() => {
    dispatch(setSplitPaneResizing({ isResizing: true }))
  }, [dispatch])

  const onResizeEnd = useCallback(() => {
    dispatch(setSplitPaneResizing({ isResizing: false }))
  }, [dispatch])

  return <DataViewComponent onResizeStart={onResizeStart} onResizeEnd={onResizeEnd} />
}

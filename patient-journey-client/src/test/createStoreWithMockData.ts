import { createStore, RootState } from '../store'
import { LoadedData } from '../data/loading'
import { loadingDataComplete } from '../data/dataSlice'
import { PatientId } from '../data/patients'
import { EntityIdNone } from '../data/entities'
import { EventId } from '../data/events'
import { EnhancedStore } from '@reduxjs/toolkit'

export const createStoreWithMockData = async (): Promise<{
  store: EnhancedStore<RootState>
  loadedData: LoadedData
}> => {
  const store = createStore()

  // TODO: Smarter mock data handling, e.g. via file
  const loadedData: LoadedData = {
    patientData: {
      columns: [
        { index: 0, name: 'PID', type: 'pid' },
        { index: 1, name: 'Name', type: 'string' },
      ],
      allEntities: [{ uid: '0' as PatientId, pid: '0' as PatientId, values: ['0', 'John'] }],
      hoveredEntity: EntityIdNone,
      selectedEntity: EntityIdNone,
    },
    eventData: {
      columns: [
        { index: 0, name: 'EID', type: 'eid' },
        { index: 1, name: 'PID', type: 'pid' },
        {
          index: 2,
          name: 'Name',
          type: 'string',
        },
      ],
      allEntities: [
        {
          uid: '0' as EventId,
          eid: '0' as EventId,
          pid: '0' as PatientId,
          values: ['0', '0', 'Special Event'],
        },
      ],
      hoveredEntity: EntityIdNone,
      selectedEntity: EntityIdNone,
    },
  }
  await store.dispatch(loadingDataComplete(loadedData))
  return { store, loadedData }
}

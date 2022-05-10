import { createStore } from '../store'
import { LoadedData } from '../data/loading'
import { loadingDataComplete } from '../data/dataSlice'
import { PatientId } from '../data/patients'
import { EventId } from '../data/events'

export const createStoreWithMockData = async () => {
  const store = createStore()

  // TODO: Smarter mock data handling, e.g. via file
  const loadedData: LoadedData = {
    patientData: {
      columns: [
        { index: 0, name: 'PID', type: 'pid' },
        { index: 1, name: 'Name', type: 'string' },
      ],
      allEntities: [{ uid: '0' as PatientId, pid: '0' as PatientId, values: ['0', 'John'] }],
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
    },
  }
  await store.dispatch(loadingDataComplete(loadedData))
  return { store, loadedData }
}

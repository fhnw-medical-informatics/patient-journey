import { createSlice, Draft, PayloadAction } from '@reduxjs/toolkit'
import { AppDispatch } from '../store'
import * as csvParser from 'papaparse'
import { EVENT_DATA_FILE_URL, PATIENT_DATA_FILE_URL } from './dataConfig'
import { createPatientData, PatientData, PatientId } from './patients'
import { createEventData, EventData } from './events'
import { GenericFilter } from './filtering'
import { EntityId, EntityIdNone } from './entities'
import { addAlerts, Alert } from '../alert/alertSlice'

type DataStateLoadingPending = Readonly<{
  type: 'loading-pending'
}>

type DataStateLoadingInProgress = Readonly<{
  type: 'loading-in-progress'
}>

export type DataStateLoadingFailed = Readonly<{
  type: 'loading-failed'
  errorMessage: string
}>

export type DataStateLoadingComplete = Readonly<{
  type: 'loading-complete'
}> &
  LoadedData &
  ActiveDataView &
  Filters

interface LoadedData {
  readonly patientData: PatientData
  readonly eventData: EventData
}

export type ActiveDataViewType = PatientData['type'] | EventData['type']

interface ActiveDataView {
  readonly view: ActiveDataViewType
}

interface Filters {
  readonly filters: ReadonlyArray<GenericFilter>
}

export type DataState =
  | DataStateLoadingPending
  | DataStateLoadingInProgress
  | DataStateLoadingFailed
  | DataStateLoadingComplete

const dataSlice = createSlice({
  name: 'data',
  initialState: { type: 'loading-pending' } as DataState,
  reducers: {
    loadingDataInProgress: (): DataState => ({
      type: 'loading-in-progress',
    }),
    loadingDataFailed: (_state: DataState, action: PayloadAction<string>): DataState => ({
      type: 'loading-failed',
      errorMessage: action.payload,
    }),
    loadingDataComplete: (_state: DataState, action: PayloadAction<LoadedData>): DataState => ({
      type: 'loading-complete',
      filters: [],
      view: 'patients',
      ...action.payload,
    }),
    setSelectedEntity: (state: Draft<DataState>, action: PayloadAction<string>) => {
      mutateActiveEntityData(
        state,
        (pd) => (pd.selectedEntity = pd.selectedEntity === action.payload ? EntityIdNone : (action.payload as EntityId))
      )
    },
    setHoveredEntity: (state: Draft<DataState>, action: PayloadAction<string>) => {
      mutateActiveEntityData(state, (pd) => (pd.hoveredEntity = action.payload as EntityId))
    },
    // TODO: Tests
    addDataFilter: (state: Draft<DataState>, action: PayloadAction<GenericFilter>) => {
      mutateFilterData(state, (fd) => {
        const existingFilterIndex = fd.findIndex((filter) => filter.column.name === action.payload.column.name)

        if (existingFilterIndex !== -1) {
          fd[existingFilterIndex] = action.payload
        } else {
          fd.push(action.payload)
        }
      })
    },
    // TODO: Tests
    removeDataFilter: (state: Draft<DataState>, action: PayloadAction<GenericFilter>) => {
      mutateFilterData(state, (fd) => {
        fd = fd.filter((filter) => filter.column.name !== action.payload.column.name)
      })
    },
    // TODO: Tests
    resetDataFilter: (state: Draft<DataState>) => ({
      ...state,
      filters: [],
    }),
    // TODO: Tests
    setDataView: (state: Draft<DataState>, action: PayloadAction<ActiveDataViewType>) => {
      mutateDataViewData(state, (vd) => {
        vd.view = action.payload
      })
    },
  },
})

const mutateActiveEntityData = (
  state: Draft<DataState>,
  applyMutation: (pd: Draft<PatientData | EventData>) => void
) => {
  if (state.type === 'loading-complete') {
    applyMutation(state.view === 'patients' ? state.patientData : state.eventData)
  }
}

const mutateDataViewData = (state: Draft<DataState>, applyMutation: (pd: Draft<ActiveDataView>) => void) => {
  if (state.type === 'loading-complete') {
    applyMutation(state)
  }
}

const mutateFilterData = (
  state: Draft<DataState>,
  applyMutation: (fd: Draft<ReadonlyArray<GenericFilter>>) => void
) => {
  if (state.type === 'loading-complete') {
    applyMutation(state.filters)
  }
}

export const dataReducer = dataSlice.reducer
export const { setSelectedEntity, setHoveredEntity, addDataFilter, removeDataFilter, resetDataFilter, setDataView } =
  dataSlice.actions

const { loadingDataInProgress, loadingDataFailed, loadingDataComplete } = dataSlice.actions

const ALERT_DATA_IMPORT_ERROR = 'Data Import Error'

export const loadData =
  (patientDataUrl: string = PATIENT_DATA_FILE_URL, eventDataUrl: string = EVENT_DATA_FILE_URL) =>
  async (dispatch: AppDispatch) => {
    dispatch(loadingDataInProgress())
    try {
      const patientData = createPatientData(await parseFromUrl(patientDataUrl))
      const eventData = createEventData(await parseFromUrl(eventDataUrl))
      const data = { patientData, eventData }
      dispatch(loadingDataComplete(data))
      const alerts = findDataInconsistencies(data)
      dispatch(addAlerts(alerts))
    } catch (e) {
      console.error(ALERT_DATA_IMPORT_ERROR, e)
      dispatch(loadingDataFailed(ALERT_DATA_IMPORT_ERROR))
      if (e instanceof Response) {
        dispatch(
          addAlerts([
            {
              topic: ALERT_DATA_IMPORT_ERROR,
              message: `${e.statusText} (${e.url})`,
            },
          ])
        )
      } else {
        dispatch(
          addAlerts([
            {
              topic: ALERT_DATA_IMPORT_ERROR,
              message: String(e),
            },
          ])
        )
      }
    }
  }

export async function parseFromUrl(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    return Promise.reject(response)
  }
  const csv = await response.text()
  return parseFromString(csv)
}

export const parseFromString = (csv: string) => {
  // use header = false to get string[][] rather than JSON -> extracting header fields ourselves
  return csvParser.parse<string[]>(csv, { header: false, skipEmptyLines: true })
}

const findDataInconsistencies = ({ patientData, eventData }: LoadedData): ReadonlyArray<Alert> => {
  let alerts = []
  const pids = patientData.allEntities.map((p) => p.pid)
  const duplicatePatientIds = findDuplicateIds(pids)
  if (duplicatePatientIds.length > 0) {
    alerts.push({
      topic: ALERT_DATA_IMPORT_ERROR,
      message: `Patient table contains non-unique pid values: [${duplicatePatientIds}]`,
    })
  }
  const eids = eventData.allEntities.map((e) => e.eid)
  const duplicateEventIds = findDuplicateIds(eids)
  if (duplicateEventIds.length > 0) {
    alerts.push({
      topic: ALERT_DATA_IMPORT_ERROR,
      message: `Event table contains non-unique eid values: [${duplicateEventIds}]`,
    })
  }
  const pidRefs = eventData.allEntities.map((e) => e.pid)
  const nonMatchingPidRefs = findNonMatchingPidRefs(new Set(pids), pidRefs)
  if (nonMatchingPidRefs.length > 0) {
    alerts.push({
      topic: ALERT_DATA_IMPORT_ERROR,
      message: `Event table contains invalid pid references: [${nonMatchingPidRefs}]`,
    })
  }
  return alerts
}

const findDuplicateIds = (uids: ReadonlyArray<EntityId>): ReadonlyArray<EntityId> => [
  ...new Set(uids.filter((e, i, a) => a.indexOf(e) !== i)),
]

const findNonMatchingPidRefs = (knownPids: ReadonlySet<PatientId>, pidRefs: ReadonlyArray<PatientId>) => [
  ...new Set(pidRefs.filter((pidRef) => !knownPids.has(pidRef))),
]

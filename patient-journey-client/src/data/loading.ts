import { createPatientData, PatientData } from './patients'
import { createEventData, EventData } from './events'
import * as csvParser from 'papaparse'
import { Alert } from '../alert/alertSlice'
import { createSimilarityData, SimilarityData } from './similarities'
import CheckDataConsistencyWorker from './workers/create-check-data-consistency?worker'
import {
  CheckDataConsistencyWorkerData,
  CheckDataConsistencyWorkerResponse,
  checkDataConsistency,
} from './workers/create-check-data-consistency'

export interface LoadingProgress {
  activeStep: LoadingStep
  isSkipConsistencyChecksRequested?: boolean
}

export enum LoadingStep {
  Patients,
  Events,
  Similarities,
  ConsistencyChecks,
}

export const DATA_FOLDER = 'data'
export const PATIENT_DATA_FILE_URL = `${DATA_FOLDER}/patients.csv`
export const EVENT_DATA_FILE_URL = `${DATA_FOLDER}/events.csv`
export const SIMILARITY_DATA_FILE_URL = `${DATA_FOLDER}/similarities.csv`

export const DATA_LOADING_ERROR = 'Data Loading Error'
export const DATA_LOADING_WARNING = 'Data Loading Warning'

const HEADER_ROW_COUNT = 2

export interface LoadedData {
  readonly patientData: PatientData
  readonly eventData: EventData
  readonly similarityData: SimilarityData
}

export const loadData = async (
  patientDataUrl: string,
  eventDataUrl: string,
  similarityDataUrl: string,
  hasWorkerSupport: boolean,
  onLoadingDataInProgress: (progress: LoadingProgress) => void,
  onLoadingDataComplete: (data: LoadedData) => void,
  onLoadingDataFailed: (message: string) => void,
  onAddAlerts: (alerts: ReadonlyArray<Alert>) => void,
  isSkipConsistencyChecksRequested: () => boolean
) => {
  const onWarning = (message: string) => onAddAlerts([{ type: 'warning', topic: DATA_LOADING_WARNING, message }])
  const onError = (message: string) => onAddAlerts([{ type: 'error', topic: DATA_LOADING_ERROR, message }])
  try {
    // loading patients
    onLoadingDataInProgress({ activeStep: LoadingStep.Patients })
    const patientData = createPatientData(
      await parseEntityDataFromUrl(patientDataUrl, 'Patient'),
      HEADER_ROW_COUNT,
      onWarning
    )

    // loading events
    onLoadingDataInProgress({ activeStep: LoadingStep.Events })
    const eventData = createEventData(await parseEntityDataFromUrl(eventDataUrl, 'Event'), HEADER_ROW_COUNT, onWarning)

    // loading similarities
    onLoadingDataInProgress({ activeStep: LoadingStep.Similarities })
    const similarityData = createSimilarityData(
      patientData.allEntities.map((e) => e.pid),
      await parseDataFromUrl(similarityDataUrl).then((r) => r.data),
      onWarning
    )

    // consistency checks
    const data = { patientData, eventData, similarityData }
    onLoadingDataInProgress({ activeStep: LoadingStep.ConsistencyChecks })
    const consistencyCheckData = { headerRowCount: HEADER_ROW_COUNT, patientData, eventData }
    if (hasWorkerSupport) {
      await checkDataConsistencyInWorker(consistencyCheckData, isSkipConsistencyChecksRequested, onWarning).catch(
        (e) => {
          dataLoadingFailed(e, onLoadingDataFailed, onError)
        }
      )
    } else {
      checkDataConsistency(consistencyCheckData, onWarning, onError)
    }
    onLoadingDataComplete(data)
  } catch (e: any) {
    dataLoadingFailed(e, onLoadingDataFailed, onError)
  }
}

const dataLoadingFailed = (
  e: any,
  onLoadingDataFailed: (message: string) => void,
  onError: (message: string) => void
) => {
  console.error(DATA_LOADING_ERROR, e)
  onLoadingDataFailed(DATA_LOADING_ERROR)
  onError(e.message)
}

async function parseDataFromUrl(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`${response.statusText} (${response.url})`)
  }
  const csv = await response.text()
  const result = parseFromString(csv)
  if (result.errors.length > 0) {
    throw new Error('Parsing errors: ' + result.errors.join('\n'))
  } else {
    return result
  }
}

async function parseEntityDataFromUrl(url: string, entityName: string) {
  const result = await parseDataFromUrl(url)
  if (result.data.length < HEADER_ROW_COUNT) {
    throw new Error(`${entityName} data table must contain two header rows (column names, column types).`)
  } else if (result.data.length === HEADER_ROW_COUNT) {
    throw new Error(`${entityName} data table must contain at least one row of data.`)
  } else {
    return result.data
  }
}

export const parseFromString = (csv: string) => {
  // use header = false to get string[][] rather than JSON -> extracting header fields ourselves
  return csvParser.parse<string[]>(csv, { header: false, skipEmptyLines: true, delimiter: ',' })
}

const checkDataConsistencyInWorker = async (
  workerData: CheckDataConsistencyWorkerData,
  isSkipConsistencyChecksRequested: () => boolean,
  onWarning: (message: string) => void
): Promise<void> =>
  new Promise<void>((resolve, reject) => {
    const worker = new CheckDataConsistencyWorker()
    worker.postMessage(workerData)
    worker.onmessage = ({ data }: MessageEvent<CheckDataConsistencyWorkerResponse>) => {
      switch (data.type) {
        case 'warning':
          onWarning(data.message)
          break
        case 'error':
          worker.terminate()
          reject(data)
          break
        case 'done':
          resolve()
      }
    }
    worker.onerror = (e) => {
      worker.terminate()
      reject(e)
    }
    const terminateIfSkipRequested = () => {
      if (isSkipConsistencyChecksRequested()) {
        worker.terminate()
        resolve()
      } else {
        requestAnimationFrame(terminateIfSkipRequested)
      }
    }

    requestAnimationFrame(terminateIfSkipRequested)
  })

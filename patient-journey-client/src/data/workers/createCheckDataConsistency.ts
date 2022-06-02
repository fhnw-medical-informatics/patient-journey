import { checkDataConsistency, ConsistencyCheckData } from '../checkDataConsistency'

type IdleResponse = Readonly<{
  type: 'idle'
}>

type ErrorResponse = Readonly<{
  type: 'error'
  message: string
}>

type SuccessResponse = Readonly<{
  type: 'success'
  warnings: ReadonlyArray<string>
}>

export type CheckDataConsistencyWorkerResponse = IdleResponse | ErrorResponse | SuccessResponse

onmessage = (e: MessageEvent<ConsistencyCheckData>) => {
  const warnings: string[] = []
  const onWarning = (message: string) => {
    warnings.push(message)
  }
  const onError = (message: string) => {
    const errorResponse: ErrorResponse = { type: 'error', message }
    postMessage(errorResponse)
  }
  checkDataConsistency(e.data, onWarning, onError)
  const successResponse: SuccessResponse = { type: 'success', warnings }
  postMessage(successResponse)
}
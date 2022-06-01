import { checkDataConsistency, ConsistencyCheckData } from '../consistency'

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
  try {
    checkDataConsistency(e.data, onWarning)
    const successResponse: SuccessResponse = { type: 'success', warnings }
    postMessage(successResponse)
  } catch (e: any) {
    const errorResponse: ErrorResponse = { type: 'error', message: e.message }
    postMessage(errorResponse)
  }
}

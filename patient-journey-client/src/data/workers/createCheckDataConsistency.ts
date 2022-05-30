import { checkDataConsistency, ConsistencyCheckData } from '../checkDataConsistency'

export type CheckDataConsistencyWorkerResponse =
  | Readonly<{
      type: 'warning'
      message: string
    }>
  | Readonly<{
      type: 'error'
      message: string
    }>
  | Readonly<{
      type: 'done'
    }>

onmessage = (e: MessageEvent<ConsistencyCheckData>) => {
  const onMessage = (type: 'warning' | 'error') => (message: string) => {
    const response: CheckDataConsistencyWorkerResponse = { type, message }
    postMessage(response)
  }
  checkDataConsistency(e.data, onMessage('warning'), onMessage('error'))
  const done: CheckDataConsistencyWorkerResponse = {
    type: 'done',
  }
  postMessage(done)
}

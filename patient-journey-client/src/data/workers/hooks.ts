import { useEffect, useState } from 'react'

export const useWorker = <D, R>(_Worker: new () => Worker, data: D, initialValue: R): R => {
  const [workerInstance, setWorkerInstance] = useState<Worker>()
  const [result, setResult] = useState<R>(initialValue)

  // Initialize worker
  useEffect(() => {
    if (!workerInstance) {
      const worker = new _Worker()
      worker.addEventListener('message', (e) => setResult(e.data))
      setWorkerInstance(worker)
    } else {
      return () => {
        workerInstance.terminate()
        setWorkerInstance(undefined)
      }
    }
  }, [workerInstance, _Worker])

  // Post data to the worker when data changes
  useEffect(() => {
    workerInstance?.postMessage(data)
  }, [workerInstance, data])

  return result
}

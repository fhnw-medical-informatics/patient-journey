import { useCallback, useEffect, useRef, useState } from 'react'

export const useWorker = <D, R>(_Worker: new () => Worker, data: D, initialValue: R): R => {
  const [workerInstance, setWorkerInstance] = useState<Worker>()
  const [result, setResult] = useState<R>(initialValue)

  let isBusy = useRef(false)
  let popData = useRef<any | undefined>(undefined)

  const flushPopData = useCallback(() => {
    if (workerInstance && popData.current && !isBusy.current) {
      isBusy.current = true
      workerInstance.postMessage(popData.current)
      popData.current = undefined
    }
  }, [workerInstance])

  // Initialize worker
  useEffect(() => {
    if (flushPopData) {
      if (!workerInstance) {
        const worker = new _Worker()
        setWorkerInstance(worker)
      } else {
        const handleWorkerResponse = (e: MessageEvent<R>) => {
          setResult(e.data)
          isBusy.current = false
          flushPopData() // TODO: Remove? Won't do anything if isBusy.current is false
        }

        workerInstance.addEventListener('message', handleWorkerResponse)

        return () => {
          workerInstance.removeEventListener('message', handleWorkerResponse)
          workerInstance.terminate()
          setWorkerInstance(undefined)
        }
      }
    }
  }, [workerInstance, _Worker, flushPopData])

  // Post data to the worker when data changes
  useEffect(() => {
    if (workerInstance) {
      popData.current = data
      flushPopData()
    }
  }, [workerInstance, data, flushPopData])

  return result
}

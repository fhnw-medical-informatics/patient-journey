import { useEffect, useRef, useState } from 'react'

export const useWorker = <D, R>(_Worker: new () => Worker, data: D, initialValue: R): R => {
  const [workerInstance, setWorkerInstance] = useState<Worker>()
  const [result, setResult] = useState<R>(initialValue)
  const [popQueueToggle, setPopQueueToggle] = useState(false)

  let isBusy = useRef(false)
  let popData = useRef<any | undefined>(undefined)

  // Initialize worker
  useEffect(() => {
    if (!workerInstance) {
      const worker = new _Worker()
      worker.addEventListener('message', (e) => {
        setResult(e.data)
        isBusy.current = false
        setPopQueueToggle((toggle) => !toggle)
      })
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
    if (workerInstance && isBusy.current === false) {
      workerInstance.postMessage(data)
      isBusy.current = true
    } else if (workerInstance && data) {
      // Worker is busy, queue data
      popData.current = data
    }
  }, [workerInstance, data])

  useEffect(() => {
    if (workerInstance && popData.current && isBusy.current === false && popQueueToggle !== undefined) {
      // Worker is not busy anymore, catch up with latest data
      isBusy.current = true
      workerInstance.postMessage(popData.current)
      popData.current = undefined
    }
  }, [popQueueToggle, workerInstance])

  return result
}

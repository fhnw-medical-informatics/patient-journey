import { useCallback, useEffect, useState } from 'react'

export const useWorker = (
  _Worker: new () => Worker,
  onMessage: (e: MessageEvent) => void
): [boolean, (msg: any) => void] => {
  const [workerInstance, setWorkerInstance] = useState<Worker>()

  useEffect(() => {
    if (!workerInstance) {
      const worker = new _Worker()
      worker.addEventListener('message', onMessage)
      setWorkerInstance(worker)
    } else {
      return () => {
        workerInstance.terminate()
        setWorkerInstance(undefined)
      }
    }
  }, [workerInstance, onMessage, _Worker])

  const postMessage = useCallback(
    (msg: any) => {
      if (workerInstance) {
        workerInstance.postMessage(msg)
      }
    },
    [workerInstance]
  )

  return [workerInstance !== undefined, postMessage]
}

import { Bin, bin } from 'd3-array'

const histogramBinCount = 10

export type NumbersBinWorkerData = {
  numbers: ReadonlyArray<number>
  min: number
  max: number
}

export type NumbersBinWorkerResponse = ReadonlyArray<Bin<number, number>>

const createNumbersBinsWorker = () => {
  function createBins(numbers: ReadonlyArray<number>, min: number, max: number): NumbersBinWorkerResponse {
    return bin<number, number>().domain([min, max]).thresholds(histogramBinCount)(numbers)
  }

  onmessage = (e: MessageEvent<NumbersBinWorkerData>) => {
    const { numbers, min, max } = e.data

    const bins = createBins(numbers, min, max)

    postMessage(bins)
  }
}

export default createNumbersBinsWorker()

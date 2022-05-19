import { bin } from 'd3-array'

const histogramBinCount = 10

const createNumbersBinsWorker = () => {
  function createBins(numbers: ReadonlyArray<number>, min: number, max: number) {
    return bin<number, number>().domain([min, max]).thresholds(histogramBinCount)(numbers)
  }

  onmessage = (e) => {
    const { numbers, min, max } = e.data

    const bins = createBins(numbers, min, max)

    postMessage(bins)
  }
}

export default createNumbersBinsWorker()

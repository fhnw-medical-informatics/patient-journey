import { Bin, bin } from 'd3-array'
import { scaleTime, ScaleTime } from 'd3-scale'

const histogramBinCount = 10

export type DateBinWorkerData = {
  dates: ReadonlyArray<Date>
  min: Date
  max: Date
}

export type DateBinWorkerResponse = ReadonlyArray<Bin<Date, Date>>

const createDateBinsWorker = () => {
  function createBins(dates: ReadonlyArray<Date>, timeScale: ScaleTime<Date, Date>): DateBinWorkerResponse {
    const [min, max] = timeScale.domain()
    return bin<Date, Date>().domain([min, max]).thresholds(timeScale.ticks(histogramBinCount))(dates)
  }

  onmessage = (e: MessageEvent<DateBinWorkerData>) => {
    const { dates, min, max } = e.data

    const timeScale = scaleTime<Date, Date>().domain([min, max]).nice()

    const bins = createBins(dates, timeScale)

    postMessage(bins)
  }
}

export default createDateBinsWorker()

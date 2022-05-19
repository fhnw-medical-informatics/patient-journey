import { bin } from 'd3-array'
import { scaleTime, ScaleTime } from 'd3-scale'

const histogramBinCount = 10

const createDateBinsWorker = () => {
  function createBins(dates: ReadonlyArray<Date>, timeScale: ScaleTime<Date, Date>) {
    const [min, max] = timeScale.domain()
    return bin<Date, Date>().domain([min, max]).thresholds(timeScale.ticks(histogramBinCount))(dates)
  }

  onmessage = (e) => {
    const { dates, min, max } = e.data

    const timeScale = scaleTime<Date, Date>().domain([min, max]).nice()

    const bins = createBins(dates, timeScale)

    postMessage(bins)
  }
}

export default createDateBinsWorker()

import { bin } from 'd3-array'
import { scaleTime, ScaleTime } from 'd3-scale'

const histogramBinCount = 10

const werkitWorker = () => {
  function createBins(dates: ReadonlyArray<Date>, timeScale: ScaleTime<Date, Date>) {
    const [min, max] = timeScale.domain()
    return bin<Date, Date>().domain([min, max]).thresholds(timeScale.ticks(histogramBinCount))(dates)
  }

  onmessage = (e) => {
    console.log('Henlo, I werk it. I received frum u:', e.data)
    const { filteredDates, min, max } = e.data

    const timeScale = scaleTime<Date, Date>().domain([min, max]).nice()

    const bins = createBins(filteredDates, timeScale)

    postMessage(bins)
  }
}

export default werkitWorker()

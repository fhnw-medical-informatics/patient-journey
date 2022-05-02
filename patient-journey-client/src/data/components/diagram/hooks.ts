import { useMemo } from 'react'

import { extent } from 'd3-array'

import { DataColumn, extractCategoryValueSafe, extractDateValueSafe, extractNumberValueSafe } from '../../columns'
import { Entity } from '../../entities'
import { scaleLinear, ScaleTime, scaleTime } from 'd3-scale'

export const useCategories = (
  allData: ReadonlyArray<Entity>,
  column: DataColumn<'category'>
): {
  allCategories: ReadonlyArray<string>
  uniqueCategories: ReadonlyArray<string>
  extractValueSafe: (entity: Entity) => [string] | []
} => {
  const extractValueSafe = useMemo(() => extractCategoryValueSafe(column), [column])

  const allCategories = useMemo(() => allData.flatMap(extractValueSafe), [allData, extractValueSafe])

  const uniqueCategories = useMemo(() => Array.from(new Set(allCategories)), [allCategories])

  return { allCategories, uniqueCategories, extractValueSafe }
}

export const useNumbers = (
  allData: ReadonlyArray<Entity>,
  column: DataColumn<'number'>
): {
  allNumbers: ReadonlyArray<number>
  min: number | undefined
  max: number | undefined
  niceMin: number
  niceMax: number
  extractValueSafe: (entity: Entity) => [number] | []
} => {
  const extractValueSafe = useMemo(() => extractNumberValueSafe(column), [column])

  const allNumbers = useMemo(() => allData.flatMap(extractValueSafe), [allData, extractValueSafe])

  const [min, max] = useMemo(() => extent(allNumbers), [allNumbers])

  const [niceMin, niceMax] = useMemo(
    () => scaleLinear<number, number>().domain([min!, max!]).nice().domain(),
    [min, max]
  )

  return { allNumbers, min, max, niceMin, niceMax, extractValueSafe }
}

export const useDates = (
  allData: ReadonlyArray<Entity>,
  column: DataColumn<'date' | 'timestamp'>
): {
  allDates: ReadonlyArray<Date>
  min: Date | undefined
  max: Date | undefined
  niceMin: Date
  niceMax: Date
  timeScale: ScaleTime<Date, Date>
  extractValueSafe: (entity: Entity) => [Date] | []
} => {
  const extractValueSafe = useMemo(() => extractDateValueSafe(column), [column])

  const allDates = useMemo(() => allData.flatMap(extractValueSafe), [allData, extractValueSafe])

  const [min, max] = useMemo(() => extent(allDates), [allDates])

  const timeScale = useMemo(() => scaleTime<Date, Date>().domain([min!, max!]).nice(), [min, max])

  const [niceMin, niceMax] = useMemo(() => timeScale.domain(), [timeScale])

  return { allDates, min, max, niceMin, niceMax, timeScale, extractValueSafe }
}

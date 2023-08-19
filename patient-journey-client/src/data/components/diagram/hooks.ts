import { useMemo } from 'react'

import { extent } from 'd3-array'

import {
  DataColumn,
  extractCategoryValueSafe,
  extractDateValueSafe,
  extractNumberValueSafe,
  extractStringValuesSafe,
} from '../../columns'
import { Entity } from '../../entities'
import { scaleLinear, ScaleTime, scaleTime } from 'd3-scale'

export const usePIDs = (
  allData: ReadonlyArray<Entity>,
  column: DataColumn<'pid'>
): {
  allPIDs: ReadonlyArray<string>
  uniquePIDs: ReadonlyArray<string>
  extractValueSafe: (entity: Entity) => [string] | []
} => {
  const extractValueSafe = useMemo(() => extractStringValuesSafe(column), [column])

  const allPIDs = useMemo(() => allData.flatMap(extractValueSafe), [allData, extractValueSafe])

  const uniquePIDs = useMemo(() => Array.from(new Set(allPIDs)), [allPIDs])

  return { allPIDs, uniquePIDs, extractValueSafe }
}

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
  min: number
  max: number
  niceMin: number
  niceMax: number
  niceStep: number
  extractValueSafe: (entity: Entity) => [number] | []
} => {
  const extractValueSafe = useMemo(() => extractNumberValueSafe(column), [column])

  const allNumbers = useMemo(() => allData.flatMap(extractValueSafe), [allData, extractValueSafe])

  const [min, max] = useMemo(() => {
    const [min, max] = extent(allNumbers)

    return [min ?? 0, max ?? 0]
  }, [allNumbers])

  const { niceMin, niceMax, niceStep } = useMemo(() => {
    const scale = scaleLinear<number, number>().domain([min, max]).nice()

    const [niceMin, niceMax] = scale.domain()

    const ticks = scale.ticks(10)

    const niceStep = ticks.length >= 2 ? scale.ticks(100)[1] - scale.ticks(10)[0] : 0

    return { niceMin, niceMax, niceStep }
  }, [min, max])

  return { allNumbers, min, max, niceMin, niceMax, niceStep, extractValueSafe }
}

export const useDates = (
  allData: ReadonlyArray<Entity>,
  column: DataColumn<'date' | 'timestamp'>
): {
  allDates: ReadonlyArray<Date>
  min: Date
  max: Date
  niceMinMillis: number
  niceMaxMillis: number
  niceStepMillis: number
  timeScale: ScaleTime<Date, Date>
  extractValueSafe: (entity: Entity) => [Date] | []
} => {
  const extractValueSafe = useMemo(() => extractDateValueSafe(column), [column])

  const allDates = useMemo(() => allData.flatMap(extractValueSafe), [allData, extractValueSafe])

  const [min, max] = useMemo(() => {
    const [min, max] = extent(allDates)

    return [min ?? new Date(0), max ?? new Date(0)]
  }, [allDates])

  const timeScale = useMemo(() => scaleTime<Date, Date>().domain([min, max]).nice(), [min, max])

  const { niceMin, niceMax, niceStepMillis } = useMemo(() => {
    const [niceMin, niceMax] = timeScale.domain()

    const ticks = timeScale.ticks(100)

    const niceStepMillis = ticks.length >= 2 ? timeScale.ticks(100)[1].valueOf() - timeScale.ticks(10)[0].valueOf() : 0

    return { niceMin, niceMax, niceStepMillis }
  }, [timeScale])

  return {
    allDates,
    min,
    max,
    niceMinMillis: niceMin.valueOf(),
    niceMaxMillis: niceMax.valueOf(),
    niceStepMillis,
    timeScale,
    extractValueSafe,
  }
}

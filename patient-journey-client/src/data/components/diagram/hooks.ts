import { useMemo } from 'react'
import { DataColumn, extractCategoryValueSafe } from '../../columns'
import { Entity } from '../../entities'

export const useCategories = (
  allData: ReadonlyArray<Entity>,
  column: DataColumn<'category'>
): { allCategories: ReadonlyArray<string>; uniqueCategories: ReadonlyArray<string> } => {
  const extractValueSafe = useMemo(() => extractCategoryValueSafe(column), [column])

  const allCategories = useMemo(() => allData.flatMap(extractValueSafe), [allData, extractValueSafe])

  const uniqueCategories = useMemo(() => Array.from(new Set(allCategories)), [allCategories])

  return { allCategories, uniqueCategories }
}

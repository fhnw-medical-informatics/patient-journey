import { useAppSelector } from '../store'
import { selectActiveSorting } from './selectors'

export const useActiveTableSorting = () => useAppSelector(selectActiveSorting)

import { useAppSelector } from '../store'
import { selectActiveTableState } from './selectors'

export const useActiveTableState = () => useAppSelector(selectActiveTableState)

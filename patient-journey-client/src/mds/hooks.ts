import { useSelector } from 'react-redux'
import { selectMdsPoints } from './selectors'

export const useMdsPoints = () => useSelector(selectMdsPoints)

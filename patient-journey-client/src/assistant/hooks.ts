import { useAppSelector } from '../store'
import { selectAssistant } from './selectors'

export const useAssistant = () => useAppSelector(selectAssistant)

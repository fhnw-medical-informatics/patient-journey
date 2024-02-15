import { selectChat } from './selectors'
import { useAppSelector } from '../store'

export const useChat = () => useAppSelector(selectChat)

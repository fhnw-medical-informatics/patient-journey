import { useAppSelector } from '../store'
import { ColorByColumnOption } from './colorSlice'
import { selectColorByColumn } from './selectors'

export const useColorByColumn = () => useAppSelector<ColorByColumnOption>(selectColorByColumn)

import { useSelector } from 'react-redux'
import {
  SCATTER_PLOT_DEFAULT_CATEGORY,
  selectActiveScatterPlotCategoryColumn,
  selectActiveScatterPlotXAxisColumn,
  selectActiveScatterPlotYAxisColumn,
  selectScatterPlotData,
} from './selectors'
import { useCallback } from 'react'
import { useColor } from '../color/hooks'
import { useCustomTheme } from '../theme/useCustomTheme'

export const useScatterPlotData = () => useSelector(selectScatterPlotData)
export const useActiveScatterPlotXAxisColumn = () => useSelector(selectActiveScatterPlotXAxisColumn)
export const useActiveScatterPlotYAxisColumn = () => useSelector(selectActiveScatterPlotYAxisColumn)
export const useActiveScatterPlotCategoryColumn = () => useSelector(selectActiveScatterPlotCategoryColumn)

export const useColorByScatterPlotCategoryFn = () => {
  const { colorByCategoryFn } = useColor('patients')
  const defaultColor = useCustomTheme().palette.text.primary
  return useCallback(
    (nivoDatum: { serieId: string | number }) => {
      if (nivoDatum.serieId === SCATTER_PLOT_DEFAULT_CATEGORY) {
        return defaultColor
      } else {
        return colorByCategoryFn(String(nivoDatum.serieId))
      }
    },
    [defaultColor, colorByCategoryFn]
  )
}

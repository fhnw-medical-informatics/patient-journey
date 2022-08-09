import { EventDataColumn } from '../../data/events'
import { PatientDataColumn } from '../../data/patients'
import { useColor } from '../hooks'
import { ColoredCircle } from '../components/ColoredCircle'

interface Props {
  readonly column: EventDataColumn | PatientDataColumn
  readonly category: string
}

export const ColorLegendCategoryCircle = ({ column, category }: Props) => {
  const { colorByColumn, colorByCategoryFn } = useColor()
  if (column === colorByColumn.column) {
    return (
      <div>
        <ColoredCircle color={colorByCategoryFn(category)} />
      </div>
    )
  } else {
    return <div />
  }
}

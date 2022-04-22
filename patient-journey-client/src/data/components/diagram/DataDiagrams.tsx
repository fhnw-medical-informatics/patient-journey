import React from 'react'
import { DateDataDiagram } from './DateDataDiagram'
import { NumberDataDiagram } from './NumberDataDiagram'
import { CategoryDataDiagram } from './CategoryDataDiagram'
import { DataDiagramsProps } from './shared'

export const DataDiagrams = ({ column, ...props }: DataDiagramsProps<any>) => {
  switch (column.type) {
    case 'number':
      return <NumberDataDiagram {...props} column={column} />
    case 'date':
    case 'timestamp':
      return <DateDataDiagram {...props} column={column} />
    case 'category':
      return <CategoryDataDiagram {...props} column={column} />
    default:
      return null
  }
}

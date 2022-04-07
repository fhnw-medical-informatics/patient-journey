import React from 'react'
import { DateDataDiagram } from './DateDataDiagram'
import { NumberDataDiagram } from './NumberDataDiagram'
import { QualityDataDiagram } from './QualityDataDiagram'
import { DataDiagramsProps } from './shared'

export const DataDiagrams = ({ column, ...props }: DataDiagramsProps) => {
  switch (column.type) {
    case 'number':
      return <NumberDataDiagram {...props} column={column} />
    case 'date':
    case 'timestamp':
      return <DateDataDiagram {...props} column={column} />
    case 'quality':
      return <QualityDataDiagram {...props} column={column} />
    default:
      return null
  }
}

import React from 'react'

import { EventData } from '../../events'
import { FilterColumn } from '../../filtering'
import { PatientData } from '../../patients'
import { DateDataDiagram } from './DateDataDiagram'
import { NumberDataDiagram } from './NumberDataDiagram'

export interface DataDiagramsProps {
  allActiveData: PatientData | EventData
  filteredActiveData: PatientData | EventData
  column: FilterColumn
}

export const DataDiagrams = ({ column, ...props }: DataDiagramsProps) => {
  switch (column.type) {
    case 'number':
      return <NumberDataDiagram {...props} column={column} />
    case 'date':
    case 'timestamp':
      return <DateDataDiagram {...props} column={column} />
    default:
      return null
  }
}

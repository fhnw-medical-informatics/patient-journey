import React from 'react'
import { FilterColumn } from '../../filtering'
import { DateDataDiagram } from './DateDataDiagram'
import { NumberDataDiagram } from './NumberDataDiagram'
import { Entity } from '../../entities'

export interface DataDiagramsProps {
  allActiveData: ReadonlyArray<Entity>
  filteredActiveData: ReadonlyArray<Entity>
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

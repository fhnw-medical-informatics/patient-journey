import React from 'react'

import { DataDiagrams as DataDiagramsComponent } from '../../components/diagram/DataDiagrams'
import { FilterColumn } from '../../filtering'
import { useActiveData, useFilteredActiveData } from '../../hooks'

export interface DataDiagramsProps {
  column: FilterColumn
}

export const DataDiagrams = ({ column }: DataDiagramsProps) => {
  const allActiveData = useActiveData()
  const filteredActiveData = useFilteredActiveData()

  return <DataDiagramsComponent allActiveData={allActiveData} filteredActiveData={filteredActiveData} column={column} />
}

import React from 'react'

import { DataTable as DataTableComponent } from '../../components/table/DataTable'
import { useActiveDataColumns, useFilteredActiveData, useEntityInteraction } from '../../hooks'

export const DataTable = () => {
  const activeData = useFilteredActiveData()
  const activeColumns = useActiveDataColumns()

  const { onEntityClick, onEntityHover, selectedEntity, hoveredEntity } = useEntityInteraction()

  return (
    <DataTableComponent
      data={activeData}
      columns={activeColumns}
      selectedEntity={selectedEntity}
      hoveredEntity={hoveredEntity}
      onEntityClick={onEntityClick}
      onEntityHover={onEntityHover}
    />
  )
}

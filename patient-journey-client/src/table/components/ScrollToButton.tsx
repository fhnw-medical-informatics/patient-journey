import React, { useCallback } from 'react'

import { Button } from '@mui/material'
import { EntityId } from '../../data/entities'
import { GridApiPro } from '@mui/x-data-grid-pro/models/gridApiPro'

import AdjustIcon from '@mui/icons-material/Adjust'

interface ScrollToButtonProps {
  label: string
  entityId: EntityId
  rows: { id: EntityId }[]
  color: string
  gridApiRef: React.MutableRefObject<GridApiPro>
}

export const ScrollToButton = ({ gridApiRef, label, rows, entityId, color }: ScrollToButtonProps) => {
  const scrollToRow = useCallback(() => {
    const rowIndex = rows.findIndex((row) => row.id === entityId)
    gridApiRef.current.scrollToIndexes({ rowIndex })
  }, [gridApiRef, rows, entityId])

  // Scroll to the row when the entityId changes
  // TODO: This does not work, because the footer is currently re-rendered always
  // The footer component needs to be extracted from the DataTable component to fix this
  //   useEffect(() => {
  //     if (entityId !== EntityIdNone) {
  //       scrollToRow()
  //     }
  //   }, [scrollToRow, entityId])

  return (
    <div style={{ color }}>
      <Button onClick={scrollToRow} variant="outlined" size="small" endIcon={<AdjustIcon />} color="inherit">
        {label}
      </Button>
    </div>
  )
}

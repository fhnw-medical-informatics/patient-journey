import React, { useCallback } from 'react'

import { Button } from '@mui/material'
import { EntityId } from '../../data/entities'
import { GridApiPro } from '@mui/x-data-grid-pro/models/gridApiPro'

import VerticalAlignCenterIcon from '@mui/icons-material/VerticalAlignCenter'

interface ScrollToButtonProps {
  label: string
  title?: string
  entityId: EntityId
  rows: { id: EntityId }[]
  color: string
  gridApiRef: React.MutableRefObject<GridApiPro>
  onClick?: (entityId: EntityId) => void
}

export const ScrollToButton = ({ gridApiRef, label, title, rows, entityId, color, onClick }: ScrollToButtonProps) => {
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
      <Button
        onClick={() => {
          scrollToRow()
          onClick?.(entityId)
        }}
        variant="outlined"
        size="small"
        endIcon={<VerticalAlignCenterIcon />}
        color="inherit"
        title={title}
        sx={{ lineHeight: 1 }}
      >
        {label}
      </Button>
    </div>
  )
}

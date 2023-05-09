import { createMakeAndWithStyles } from 'tss-react'
import { useTheme } from '@mui/material'
export const { makeStyles, withStyles } = createMakeAndWithStyles({ useTheme })
export const noOp = () => {}
export const diff = (value1: number, value2: number): number => {
  return Math.abs(Math.max(value1, value2) - Math.min(value1, value2))
}
export const getChunkSize = (total: number, chunks: number): number => {
  let _chunks = chunks

  while (total % _chunks !== 0) {
    _chunks--
  }

  return total / _chunks
}

// Canvas state changes are expensive, only change if needed
export function changeCanvasFillStyle(ctx: CanvasRenderingContext2D, color: string): void {
  if (ctx.fillStyle !== color) {
    ctx.fillStyle = color
  }
}

export const sha256 = async (message: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

import React from 'react'
import { ScaleBand } from 'd3-scale'
import { TimelineLane, useTimelineTheme } from 'react-svg-timeline'
import { Axis } from './Axis'
import { useTheme } from '@mui/material'
import { createFocusColor } from '../../theme/useCustomTheme'

const MAX_LABEL_FONT_SIZE = 18

export interface AxesProps<PatientId extends string> {
  readonly focusLaneId: PatientId
  readonly selectedEntityId: PatientId
  readonly indexPatientId: PatientId
  readonly lanes: ReadonlyArray<TimelineLane<PatientId>>
  readonly yScale: ScaleBand<PatientId>
  readonly isHideLaneDetails: boolean
}

export const Axes = <PatientId extends string>({
  focusLaneId,
  selectedEntityId,
  indexPatientId,
  lanes,
  yScale,
  isHideLaneDetails,
}: AxesProps<PatientId>) => {
  const muiTheme = useTheme()
  const theme = useTimelineTheme()

  // TODO: Improve font handling
  // - re-implement using canvas (proper font metrics)
  // - foreignObject (CSS alignment and background color) https://stackoverflow.com/a/48194342/57448

  const fontSize = isHideLaneDetails ? MAX_LABEL_FONT_SIZE : Math.min(yScale.bandwidth(), MAX_LABEL_FONT_SIZE)
  const textBackgroundRectWidth = fontSize * 3.7
  const labelXOffset = 15
  return (
    <>
      {lanes.map((lane: TimelineLane<PatientId>) => {
        const y = yScale(lane.laneId)!

        const isFocused = lane.laneId === focusLaneId
        const isSelected = lane.laneId === selectedEntityId
        const isIndexPatient = lane.laneId === indexPatientId

        const fontWeight = isFocused ? 800 : 600

        const isEnabled = isFocused || isSelected || isIndexPatient || !isHideLaneDetails

        const color = isIndexPatient
          ? muiTheme.entityColors.indexPatient
          : isSelected
          ? muiTheme.entityColors.selected
          : lane.color ?? theme.lane.middleLineColor
        const augmentedColor = isFocused ? createFocusColor(muiTheme, color) : color

        return (
          isEnabled && (
            <g key={`axis-${lane.laneId}`}>
              <Axis y={y} color={augmentedColor} isFocused={isFocused || isIndexPatient || isSelected} />
              <rect
                x={labelXOffset - 3}
                width={textBackgroundRectWidth}
                height={theme.lane.labelFontSize}
                y={y - theme.lane.labelFontSize / 2}
                fill={muiTheme.palette.background.paper}
              ></rect>
              <text
                style={{
                  fontFamily: theme.base.fontFamily,
                  fontWeight,
                  dominantBaseline: 'central',
                }}
                fontSize={fontSize}
                x={labelXOffset}
                y={y}
                fill={augmentedColor}
              >
                {lane.label}
              </text>
            </g>
          )
        )
      })}
    </>
  )
}

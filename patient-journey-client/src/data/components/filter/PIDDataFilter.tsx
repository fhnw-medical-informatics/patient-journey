import React, { useCallback } from 'react'

import { Button, Stack } from '@mui/material'

import { Filter } from '../../filtering'
import { Entity, EntityId, EntityIdNone } from '../../entities'
import { GenericDataFilter } from './GenericCategoryFilter'
import { usePIDs } from '../diagram/hooks'
import { DataColumn } from '../../columns'

export interface PIDDataFilterProps extends Filter<'pid'> {
  selectedPatientPID: EntityId
  patientCohort: ReadonlySet<EntityId>
  allActiveData: ReadonlyArray<Entity>
  onChange: (filter: Filter<'pid'>) => void
  onRemove: (filter: Filter<'pid'>) => void
}

export const PIDDataFilter = ({
  selectedPatientPID,
  patientCohort,
  allActiveData,
  column,
  type,
  value,
  onChange,
  onRemove,
}: PIDDataFilterProps) => {
  const { uniquePIDs } = usePIDs(allActiveData, column as DataColumn<'pid'>)

  const createValue = useCallback((values: string[]) => ({ uids: values } as Filter<'pid'>['value']), [])
  const extractValue = useCallback(
    (filterValue: Filter<'pid'>['value']) => (filterValue.uids.length !== 0 ? filterValue.uids : []),
    []
  )

  const children = useCallback(
    (handleChange: (values: string[]) => void) => (
      <Stack component={'div'} direction="column" gap={1} sx={{ marginTop: 2 }}>
        {selectedPatientPID !== EntityIdNone && (
          <Button
            variant="text"
            onClick={() => handleChange([selectedPatientPID])}
            disabled={new Set(value.uids).has(selectedPatientPID)}
            size="small"
          >
            Isolate selected patient {selectedPatientPID}
          </Button>
        )}
        {patientCohort.size > 0 && (
          <Button
            variant="text"
            onClick={() => handleChange([...patientCohort.values()])}
            disabled={
              patientCohort.size === value.uids.length &&
              [...patientCohort.values()].every((id) => value.uids.includes(id))
            }
            size="small"
          >
            Isolate cohort ({patientCohort.size})
          </Button>
        )}
      </Stack>
    ),
    [selectedPatientPID, patientCohort, value]
  )

  return (
    <GenericDataFilter
      uniqueData={uniquePIDs}
      column={column}
      type={type}
      value={value}
      createValue={createValue}
      extractValue={extractValue}
      onChange={onChange}
      onRemove={onRemove}
    >
      {children}
    </GenericDataFilter>
  )
}

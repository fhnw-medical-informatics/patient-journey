import React from 'react'

import { PIDDataFilter as PIDDataFilterComponent } from '../../components/filter/PIDDataFilter'

import { Filter } from '../../filtering'
import { useSelectedEntityPID } from '../../hooks'

export interface PIDDataFilterProps extends Filter<'pid'> {
  onChange: (filter: Filter<'pid'>) => void
  onRemove: (filter: Filter<'pid'>) => void
}

export const PIDDataFilter = (props: PIDDataFilterProps) => {
  const selectedEntityPID = useSelectedEntityPID()

  return <PIDDataFilterComponent selectedPatientPID={selectedEntityPID} {...props} />
}

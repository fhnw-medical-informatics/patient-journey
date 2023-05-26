import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { usePatientCohort } from '../../hooks'
import { PatientId } from '../../patients'
import { clearCohort, removeFromCohort } from '../../dataSlice'
import { CohortToolbarItem as CohortToolbarItemComponent } from '../../components/cohort/CohortToolbarItem'

export const CohortToolbarItem = () => {
  const cohort = usePatientCohort()

  const dispatch = useDispatch()
  const onRemoveFromCohort = useCallback(
    (id: PatientId) => {
      dispatch(removeFromCohort({ id }))
    },
    [dispatch]
  )
  const onClearCohort = useCallback(() => {
    dispatch(clearCohort())
  }, [dispatch])

  const onCopyToClipboard = useCallback(() => {
    navigator.clipboard.writeText([...cohort].join('\n'))
  }, [cohort])

  return (
    <CohortToolbarItemComponent
      cohort={cohort}
      onRemoveFromCohort={onRemoveFromCohort}
      onClearCohort={onClearCohort}
      onCopyToClipboard={onCopyToClipboard}
    />
  )
}
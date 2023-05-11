import { CohortToolbarItem as CohortToolbarItemComponent } from '../components/CohortToolbarItem'
import { usePatientCohort } from '../hooks'

export const CohortToolbarItem = () => {
  const count = usePatientCohort().size
  return <CohortToolbarItemComponent count={count} />
}

import { MdsView as MdsViewComponent } from '../components/MdsView'

import { useAppDispatch } from '../../store'
import { create2dProjection } from '../mdsSlice'
import { useMdsPoints } from '../hooks'

export const MdsView = () => {
  const points = useMdsPoints()

  const dispatch = useAppDispatch()
  dispatch(create2dProjection())

  return <MdsViewComponent points={points} />
}

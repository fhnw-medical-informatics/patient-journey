import { useAppDispatch, useAppSelector } from '../../store'
import { AlertsButton as AlertsButtonComponent } from '../components/AlertsButton'
import { useCallback } from 'react'
import { markAlertsRead } from '../alertSlice'

export const AlertsButton = () => {
  const alertState = useAppSelector((s) => s.alert)
  const dispatch = useAppDispatch()
  const onMarkAlertsRead = useCallback(() => dispatch(markAlertsRead()), [dispatch])
  return <AlertsButtonComponent alertState={alertState} onMarkAlertsRead={onMarkAlertsRead} />
}

import { useAppSelector } from '../../store'
import { Data as DataComponent } from '../components/Data'

export const Data = () => {
  const data = useAppSelector((s) => s.data)
  return <DataComponent data={data} />
}

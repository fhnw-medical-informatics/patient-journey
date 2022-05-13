import { createSimilarityData } from './similarities'
import { noOp } from '../utils'
import { PatientId } from './patients'

const P1 = 'P1' as PatientId
const P2 = 'P2' as PatientId
const P3 = 'P3' as PatientId
const P4 = 'P4' as PatientId

const MOCK_DATA = [
  ['↓ Other Patient | Index Patient →', P1, P2, P3],
  [P1, '1', '2', '3'],
  [P2, '4', '1', '5'],
  [P3, '6', '7', '1'],
]

describe('similarities', () => {
  it('createSimilarityData', () => {
    const similarityData = createSimilarityData([P1, P2, P3], MOCK_DATA, noOp)
    expect(similarityData).toEqual({
      P1: {
        indexPatient: P1,
        P1: '1',
        P2: '4',
        P3: '6',
      },
      P2: {
        indexPatient: P2,
        P1: '2',
        P2: '1',
        P3: '7',
      },
      P3: {
        indexPatient: P3,
        P1: '3',
        P2: '5',
        P3: '1',
      },
    })
  })
  it('createSimilarityData – init missing values to empty string', () => {
    const similarityData = createSimilarityData([P1, P2, P3, P4], MOCK_DATA, noOp)
    expect(similarityData).toEqual({
      P1: {
        indexPatient: P1,
        P1: '1',
        P2: '4',
        P3: '6',
        P4: '',
      },
      P2: {
        indexPatient: P2,
        P1: '2',
        P2: '1',
        P3: '7',
        P4: '',
      },
      P3: {
        indexPatient: P3,
        P1: '3',
        P2: '5',
        P3: '1',
        P4: '',
      },
      P4: {
        indexPatient: P4,
        P1: '',
        P2: '',
        P3: '',
        P4: '',
      },
    })
  })
  it('createSimilarityData – no file contents', () => {
    const similarityData = createSimilarityData([P1], [], noOp)
    expect(similarityData).toEqual({
      P1: {
        indexPatient: P1,
        P1: '',
      },
    })
  })
})

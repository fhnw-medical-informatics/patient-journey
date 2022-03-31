import { isPatientDataColumnType, PATIENT_DATA_COLUMN_TYPES } from './patients'

describe('patients', () => {
  it('isPatientDataColumnType', () => {
    PATIENT_DATA_COLUMN_TYPES.forEach((type) => {
      expect(isPatientDataColumnType(type)).toBe(true)
    })
    expect(isPatientDataColumnType('eid')).toBe(false)
  })
})

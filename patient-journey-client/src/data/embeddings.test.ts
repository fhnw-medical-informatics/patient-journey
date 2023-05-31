import { preparePatientJourneys } from './embeddings'
import { EventData, EventId } from './events'
import { PatientData, PatientId } from './patients'

describe('preparePatientJourneys', () => {
  // match snapshot
  it('should return a patient journey as a string', () => {
    const patientData: PatientData = {
      allEntities: [
        {
          pid: '1' as PatientId,
          uid: '1' as PatientId,
          values: ['Patient 1', 'Male'],
        },
        {
          pid: '2' as PatientId,
          uid: '2' as PatientId,
          values: ['Patient 2', 'Female'],
        },
      ],
      columns: [
        {
          name: 'Patient',
          type: 'string',
          index: 0,
        },
        {
          name: 'Gender',
          type: 'string',
          index: 1,
        },
      ],
    }

    const eventData: EventData = {
      allEntities: [
        {
          eid: '1' as EventId,
          pid: '1' as PatientId,
          uid: '1' as EventId,
          values: ['Event 1', '2019-01-01'],
        },
        {
          eid: '2' as EventId,
          pid: '1' as PatientId,
          uid: '2' as EventId,
          values: ['Event 2', '2019-01-02'],
        },
        {
          eid: '3' as EventId,
          pid: '2' as PatientId,
          uid: '3' as EventId,
          values: ['Event 3', '2019-01-03'],
        },
      ],
      columns: [
        {
          name: 'Event',
          type: 'string',
          index: 0,
        },
        {
          name: 'Date',
          type: 'date',
          index: 1,
        },
      ],
    }

    const patientJourneys = preparePatientJourneys(patientData, eventData)
    expect(patientJourneys).toMatchSnapshot()
  })
})

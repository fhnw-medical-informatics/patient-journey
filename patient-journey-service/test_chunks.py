import pytest
from chunks import create_patient_journeys_chunks, MAX_ENTRIES_PER_CHUNK

def test_normal_case():
    journeys = ["a", "b", "c"]
    result = create_patient_journeys_chunks(journeys, "text-embedding-ada-002", 3)
    assert 'total_nr_of_tokens' in result
    assert 'patient_journey_chunks' in result
    assert result['total_nr_of_tokens'] == 3
    assert len(result['patient_journey_chunks']) == 1  # Assuming all journeys fit in one chunk

def test_empty_list():
    journeys = []
    result = create_patient_journeys_chunks(journeys, "text-embedding-ada-002", 3)
    assert result['total_nr_of_tokens'] == 0
    assert len(result['patient_journey_chunks']) == 0

def test_list_with_empty_string():
    journeys = ["", "b", "c"]
    with pytest.raises(ValueError) as excinfo:
        create_patient_journeys_chunks(journeys, "text-embedding-ada-002", 3)
    assert "empty" in str(excinfo.value)

def test_journey_exceeds_max_tokens():
    long_journey = "journey" # 2 Tokens (jour|ney) -> https://platform.openai.com/tokenizer
    journeys = [long_journey, long_journey]
    result = create_patient_journeys_chunks(journeys, "text-embedding-ada-002", 2)
    assert result['total_nr_of_tokens'] == 4
    assert len(result['patient_journey_chunks']) == 2
    assert result['patient_journey_chunks'][0][0] == "journey"
    assert result['patient_journey_chunks'][1][0] == "journey"

def test_chunk_exceeds_max_entries():
    journeys = ["a"] * (2048 + 1)
    result = create_patient_journeys_chunks(journeys, "text-embedding-ada-002", 6000)
    assert len(result['patient_journey_chunks']) == 2
    assert len(result['patient_journey_chunks'][0]) == 2048
    assert len(result['patient_journey_chunks'][1]) == 1

def test_shrinking_logic():
    long_journey = "journey" # 2 Tokens (jour|ney) -> https://platform.openai.com/tokenizer
    journeys = [long_journey]
    result = create_patient_journeys_chunks(journeys, "text-embedding-ada-002", 1)
    assert result['total_nr_of_tokens'] == 1
    assert len(result['patient_journey_chunks']) == 1
    assert result['patient_journey_chunks'][0][0] == "jour"
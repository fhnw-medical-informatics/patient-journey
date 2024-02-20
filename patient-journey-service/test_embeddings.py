import pytest
from embeddings import create_embeddings_for_chunk, create_embeddings

from unittest.mock import patch, MagicMock

MOCK_EMBEDDINGS = [
                    -0.006929283495992422,
                    -0.005336422007530928,
                    -0.024047505110502243
                ]

# Define a helper function to create a mock response based on the input list
def create_openai_mock_response(input_list):
    # Create a list of mock embedding objects
    mock_data = [
        MagicMock(
            object="embedding",
            index=index,
            embedding=MOCK_EMBEDDINGS
        ) for index, _ in enumerate(input_list)
    ]
    
    # Create the mock response object with the 'data' attribute set to the mock data list
    mock_response = MagicMock()
    mock_response.data = mock_data
    return mock_response

# Define a helper function to create a list of mock embeddings based on the input list
def create_embeddings_mock_response(input_list):
    return [MOCK_EMBEDDINGS for _ in input_list]

# Test the normal case where embeddings are successfully created
@patch('embeddings.openaiAPI')
def test_create_embeddings_for_chunk_normal_case(mock_openaiAPI):
    chunk = ["test1", "test2"]
    # Arrange
    mock_openaiAPI.embeddings.create.return_value = create_openai_mock_response(chunk)
    
    # Act
    embeddings = create_embeddings_for_chunk(chunk)
    
    # Assert
    assert len(embeddings) == 2
    assert embeddings[0] == MOCK_EMBEDDINGS

    mock_openaiAPI.embeddings.create.assert_called_once_with(
        model="text-embedding-ada-002",
        input=chunk
    )

# Test the case where the input list is empty
@patch('embeddings.openaiAPI')
def test_create_embeddings_for_chunk_empty_input(mock_openaiAPI):
    chunk = []

    # Arrange
    mock_openaiAPI.embeddings.create.return_value = create_openai_mock_response(chunk)
    
    # Act & Assert
    with pytest.raises(Exception) as excinfo:
        create_embeddings_for_chunk([])
    assert "An error occurred while generating embeddings." in str(excinfo.value)

# Test the case where the API response is missing data
@patch('embeddings.openaiAPI')
def test_create_embeddings_for_chunk_missing_data(mock_openaiAPI):
    chunk = ["test1", "test2"]

    # Arrange
    mock_openaiAPI.embeddings.create.return_value = None
    
    # Act & Assert
    with pytest.raises(Exception) as excinfo:
        create_embeddings_for_chunk(chunk)
    assert "An error occurred while generating embeddings." in str(excinfo.value)

# Test the case where the API response has a different number of embeddings than inputs
@patch('embeddings.openaiAPI')
def test_create_embeddings_for_chunk_mismatched_response(mock_openaiAPI):
    chunk = ["test1", "test2"]

    mock_response = create_openai_mock_response(chunk)
    mock_response.data = mock_response.data[:-1]  # Remove one of the embeddings

    assert len(mock_response.data) != len(chunk)

    # Arrange
    mock_openaiAPI.embeddings.create.return_value = mock_response
    
    # Act & Assert
    with pytest.raises(Exception) as excinfo:
        create_embeddings_for_chunk(chunk)
    assert "An error occurred while generating embeddings." in str(excinfo.value)


# Test the normal case where embeddings are successfully created
@patch('embeddings.create_embeddings_for_chunk')
@patch('embeddings.create_patient_journeys_chunks')
def test_create_embeddings_normal_case(mock_create_patient_journeys_chunks, mock_create_embeddings_for_chunk):
    patient_journeys = ["test1", "test2"]
    chunk = ["test1", "test2"]
    embeddings = create_embeddings_mock_response(chunk)

    # Arrange
    mock_create_patient_journeys_chunks.return_value = {
        'total_nr_of_tokens': 2,
        'patient_journey_chunks': [chunk]
    }
    mock_create_embeddings_for_chunk.return_value = embeddings
    
    # Act
    result = create_embeddings(patient_journeys)
    
    # Assert
    assert len(result) == 2
    assert result == embeddings

# Test the normal case where embeddings are successfully created for multiple chunks
@patch('embeddings.create_embeddings_for_chunk')
@patch('embeddings.create_patient_journeys_chunks')
def test_create_embeddings_multiple_chunks(mock_create_patient_journeys_chunks, mock_create_embeddings_for_chunk):
    patient_journeys = ["test1", "test2", "test3", "test4"]
    chunk1 = ["test1", "test2"]
    chunk2 = ["test3", "test4"]
    embeddings1 = create_embeddings_mock_response(chunk1)
    embeddings2 = create_embeddings_mock_response(chunk2)

    # Arrange
    mock_create_patient_journeys_chunks.return_value = {
        'total_nr_of_tokens': 4,
        'patient_journey_chunks': [chunk1, chunk2]
    }
    mock_create_embeddings_for_chunk.side_effect = [embeddings1, embeddings2]
    
    # Act
    result = create_embeddings(patient_journeys)
    
    # Assert
    assert len(result) == 4
    assert result == embeddings1 + embeddings2


# Test the case where no patient journeys are provided
@patch('embeddings.create_embeddings_for_chunk')
@patch('embeddings.create_patient_journeys_chunks')
def test_create_embeddings_no_patient_journeys(mock_create_patient_journeys_chunks, mock_create_embeddings_for_chunk):
    patient_journeys = []
    
    # Arrange
    mock_create_patient_journeys_chunks.return_value = {
        'total_nr_of_tokens': 0,
        'patient_journey_chunks': []
    }
    
    # Act
    result = create_embeddings(patient_journeys)
    
    # Assert
    assert result == []

# Test the case where an empty chunk is provided
@patch('embeddings.create_embeddings_for_chunk')
@patch('embeddings.create_patient_journeys_chunks')
def test_create_embeddings_empty_chunk(mock_create_patient_journeys_chunks, mock_create_embeddings_for_chunk):
    patient_journeys = ["test1", "test2"]
    empty_chunk = []
    
    # Arrange
    mock_create_patient_journeys_chunks.return_value = {
        'total_nr_of_tokens': 2,
        'patient_journey_chunks': [empty_chunk]
    }
    
    # Act & Assert
    with pytest.raises(Exception) as excinfo:
        create_embeddings(patient_journeys)
    assert "Not all embeddings were generated." in str(excinfo.value)

# Test the case where the OpenAI API fails to return embeddings
@patch('embeddings.create_embeddings_for_chunk', side_effect=Exception("OpenAI API error"))
@patch('embeddings.create_patient_journeys_chunks')
def test_create_embeddings_api_failure(mock_create_patient_journeys_chunks, mock_create_embeddings_for_chunk):
    patient_journeys = ["test1", "test2"]
    chunk = ["test1", "test2"]
    
    # Arrange
    mock_create_patient_journeys_chunks.return_value = {
        'total_nr_of_tokens': 2,
        'patient_journey_chunks': [chunk]
    }
    
    # Act & Assert
    with pytest.raises(Exception) as excinfo:
        create_embeddings(patient_journeys)
    assert "OpenAI API error" in str(excinfo.value)

# Test the case where the number of embeddings does not match the number of patient journeys
@patch('embeddings.create_embeddings_for_chunk')
@patch('embeddings.create_patient_journeys_chunks')
def test_create_embeddings_mismatched_lengths(mock_create_patient_journeys_chunks, mock_create_embeddings_for_chunk):
    patient_journeys = ["test1", "test2", "test3"]
    chunk = ["test1", "test2"]
    embeddings = create_embeddings_mock_response(chunk)
    
    # Arrange
    mock_create_patient_journeys_chunks.return_value = {
        'total_nr_of_tokens': 3,
        'patient_journey_chunks': [chunk]
    }
    mock_create_embeddings_for_chunk.return_value = embeddings
    
    # Act & Assert
    with pytest.raises(Exception) as excinfo:
        create_embeddings(patient_journeys)
    assert "Not all embeddings were generated." in str(excinfo.value)

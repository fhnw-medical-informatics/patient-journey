import tiktoken

# Source:
# https://platform.openai.com/docs/api-reference/embeddings/create
MAX_ENTRIES_PER_CHUNK = 2048

def create_patient_journeys_chunks(journeys: list[str], model: str = "text-embedding-ada-002", max_tokens_per_chunk: int = 6000) -> dict:
    """
    Create chunks of patient journeys to be sent to the embeddings API.
    Each chunk is a list of patient journeys (strings).

    Restrictions:
    - The total number of tokens in a chunk must be less than or equal to max_tokens_per_chunk.
    - A single chunk can contain a maximum of 2048 entries.
    - A chunk cannot be empty

    :param journeys: List of patient journey strings
    :param max_tokens_per_chunk: Maximum number of tokens per chunk
    :return: Dictionary with total number of tokens and list of patient journey chunks
    """

    chunks, current_chunk = [], []
    total_nr_of_tokens, current_chunk_tokens = 0, 0

    # https://cookbook.openai.com/examples/how_to_count_tokens_with_tiktoken
    tokens = tiktoken.encoding_for_model(model)

    for idx, journey in enumerate(journeys):
        if not journey:
            raise ValueError(f"Patient journey {idx} is empty and cannot be processed.")
        journey_string = journey
        journey_tokens = tokens.encode(journey_string)
        journey_token_count = len(journey_tokens)

        if journey_token_count > max_tokens_per_chunk:
            print(f"Patient journey {idx} exceeds max tokens, truncating to fit.")
            journey_tokens = journey_tokens[:max_tokens_per_chunk]
            journey_string = tokens.decode(journey_tokens)
            journey_token_count = max_tokens_per_chunk

        if (current_chunk_tokens + journey_token_count > max_tokens_per_chunk) or (len(current_chunk) >= MAX_ENTRIES_PER_CHUNK):
            chunks.append(current_chunk)
            current_chunk, current_chunk_tokens = [], 0

        current_chunk.append(journey_string)
        current_chunk_tokens += journey_token_count
        total_nr_of_tokens += journey_token_count

    if current_chunk:
        chunks.append(current_chunk)

    return {
        'total_nr_of_tokens': total_nr_of_tokens,
        'patient_journey_chunks': chunks
    }

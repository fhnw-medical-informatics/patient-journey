import tiktoken

# Source:
# https://platform.openai.com/docs/api-reference/embeddings/create
MAX_ENTRIES_PER_CHUNK = 2048

def create_patient_journeys_chunks(journeys: list[str], model: str = "text-embedding-ada-002", max_tokens_per_chunk: int = 6000) -> dict:
    """
    Create chunks of patient journeys to be sent to the embeddings api.
    Each chunk is a list of patient journeys (strings).

    Restrictions:
    - The total number of tokens in a chunk must be less than or equal to max_tokens_per_chunk.
    - A single chunk can contain a maximum of 2048 entries.
    - A chunk cannot be empty

    :param journeys: List of patient journey strings
    :param max_tokens_per_chunk: Maximum number of tokens per chunk
    :return: Dictionary with total number of tokens and list of patient journey chunks
    """

    chunks: list[list[str]] = []
    total_nr_of_tokens: int = 0
    current_chunk: list[str] = []
    current_chunk_tokens: int = 0

    # https://cookbook.openai.com/examples/how_to_count_tokens_with_tiktoken
    encoding = tiktoken.encoding_for_model(model)

    for idx, journey in enumerate(journeys):
        journey_string = journey

        # A journey cannot be empty
        if len(journey_string) == 0:
            # Replace empty journey with "EMPTY"
            # so that the total number of embeddings is not affected
            journey_string = "EMPTY"

        journey_tokens = len(encoding.encode(journey_string))

        # If a single journey is longer than the max number of tokens per chunk, shrink it until it fits
        if journey_tokens > max_tokens_per_chunk:
            print(f"Patient journey {idx} is longer than the max number of tokens per chunk. It has {journey_tokens} tokens.")

            while journey_tokens > max_tokens_per_chunk:
                journey_string = journey_string[:-1000]
                journey_tokens = len(tiktoken.encode(journey_string))

            print(f"Patient journey {idx} was longer than the max number of tokens per chunk. It was shrunk to fit. Now it has {journey_tokens} tokens.")

        # If the current chunk is full, start a new chunk
        if current_chunk_tokens + journey_tokens > max_tokens_per_chunk or len(current_chunk) >= MAX_ENTRIES_PER_CHUNK:
            chunks.append(current_chunk)
            current_chunk = []
            current_chunk_tokens = 0

        current_chunk.append(journey_string)
        current_chunk_tokens += journey_tokens
        total_nr_of_tokens += journey_tokens

    if current_chunk_tokens > 0:
        chunks.append(current_chunk)

    return {
        'total_nr_of_tokens': total_nr_of_tokens,
        'patient_journey_chunks': chunks
    }

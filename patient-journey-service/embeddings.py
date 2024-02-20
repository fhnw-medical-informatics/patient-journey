import os
from dotenv import load_dotenv
from openai import OpenAI
from chunks import create_patient_journeys_chunks

# Load the environment variables from the .env file
load_dotenv(".env.local")

# Sources:
# https://platform.openai.com/docs/guides/embeddings/embedding-models
# https://openai.com/pricing
EMBEDDINGS_API_COSTS_PER_1KTOKENS = 0.0001
MODEL = "text-embedding-ada-002"
TOKENS_PER_CHUNK = 6000 # text-embedding-ada-002 has a limit of 8191 tokens per request

openaiAPI = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
    max_retries=5
)

def create_embeddings_for_chunk(chunk: list[str], model: str = "text-embedding-ada-002") -> list[list[float]]:
    """
    Generate embeddings for a given chunk of text using the specified model.

    :param chunk: A list of strings for which to generate embeddings.
    :param model: The model to use for generating embeddings. Defaults to "text-embedding-ada-002".
    :return: A list of embeddings, where each embedding corresponds to an item in the input chunk.
    :raises Exception: If the embeddings cannot be generated or the response is invalid.
    """
    if not chunk:
        return []

    try:
        embeddings_response = openaiAPI.embeddings.create(model=model, input=chunk)
    except Exception as e:
        raise Exception(f"Failed to generate embeddings: {e}")

    if not embeddings_response or len(embeddings_response.data) != len(chunk):
        raise Exception("Invalid response from embeddings API.")

    return [embedding.embedding for embedding in embeddings_response.data]

def create_embeddings(patient_journeys: list[str]) -> list[list[float]]:
    """Generate embeddings for a list of patient journeys.

    :param patient_journeys: A list of patient journey strings.
    :return: A list of embeddings for each patient journey.
    :raises Exception: If not all embeddings are generated.
    """
    chunks_info = create_patient_journeys_chunks(patient_journeys, MODEL, TOKENS_PER_CHUNK)
    patient_journey_chunks = chunks_info['patient_journey_chunks']
    total_tokens = chunks_info['total_nr_of_tokens']
    num_chunks = len(patient_journey_chunks)

    print_embedding_generation_info(len(patient_journeys), num_chunks, total_tokens)

    embeddings = []
    
    for i, chunk in enumerate(patient_journey_chunks):
        display_progress(i, num_chunks)
        embeddings.extend(generate_chunk_embeddings(chunk, i, num_chunks))

    validate_embeddings_count(embeddings, patient_journeys)

    return embeddings

def print_embedding_generation_info(num_journeys: int, num_chunks: int, total_tokens: int):
    """Prints information about the embedding generation process."""
    print(f"🧩 Generating embeddings using the `{MODEL}` model.")
    print(f"Patient Journeys: {num_journeys}")
    print(f"Chunks: {num_chunks}")
    print(f"Tokens: {total_tokens}")
    estimated_cost = (total_tokens / 1000) * EMBEDDINGS_API_COSTS_PER_1KTOKENS
    print(f"====================\n💸 Estimated costs: ${estimated_cost:.4f}\n====================\n")

def display_progress(current_chunk: int, total_chunks: int):
    """Displays the progress of the embedding generation."""
    progress = (current_chunk + 1) / total_chunks
    progress_bar = ('#' * int(progress * 20)).ljust(20)
    print(f"\r[{progress_bar}] Chunk {current_chunk + 1}/{total_chunks} being sent to openai embeddings api.", end='')

def generate_chunk_embeddings(chunk: list[str], chunk_index: int, total_chunks: int) -> list[list[float]]:
    """Generates embeddings for a single chunk and handles exceptions."""
    try:
        return create_embeddings_for_chunk(chunk, MODEL)
    except Exception as e:
        error_message = f"\nAn error occurred while generating embeddings for chunk {chunk_index + 1} of {total_chunks}: {e}"
        print(error_message)
        raise Exception(error_message)

def validate_embeddings_count(embeddings: list[list[float]], patient_journeys: list[str]):
    """Validates that the number of generated embeddings matches the number of patient journeys."""
    if len(embeddings) != len(patient_journeys):
        error_message = f"Number of embeddings generated ({len(embeddings)}) does not match the number of patient journeys ({len(patient_journeys)})."
        print(error_message)
        raise Exception("Not all embeddings were generated.")
    print(f"✅ Finished generating {len(embeddings)} embeddings for {len(patient_journeys)} patient journeys.\n")



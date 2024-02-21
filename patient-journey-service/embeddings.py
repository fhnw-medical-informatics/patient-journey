import os

import json

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

def resumable_create_embeddings(patient_journeys: list[str], journeys_hash: str) -> list[list[float]]:
    """
    Generate embeddings for a list of patient journeys.
    But if an exception occurs, the function will store the partial results in a file and raise an exception.
    When the function is run again with the same input, it will load the partial results from the file and continue where it left off.

    Since the embeddings are created in the same order as the partient_journeys list, when a partial result is loaded from the file,
    the function will skip the patient journeys for which embeddings were already generated and append the new embeddings to the partial results.

    If another error happens, the function will do the same again, storing the new partial results in the file. Until all embeddings are generated.

    In order to identify the partial results file, the function will use the hash of the input list of patient journeys.

    Once all embeddings are generated, the function will delete the partial results file.

    This function uses the create_embeddings function to generate the embeddings.

    :param patient_journeys: A list of patient journey strings.
    :return: A list of embeddings for each patient journey.
    :raises Exception: If not all embeddings are generated.
    """
    # Calculate a hash of the patient_journeys list to use as a filename
    partial_results_file = f"partial_embeddings_{journeys_hash}.json"

    resumable_data = get_remaining_journeys_and_cached_embeddings_from_file(patient_journeys, partial_results_file)

    partial_embeddings = resumable_data['partial_embeddings']
    remaining_patient_journeys = resumable_data['remaining_patient_journeys']

    try:
        # Generate embeddings for the remaining patient journeys
        new_embeddings = create_embeddings(remaining_patient_journeys)
        partial_embeddings.extend(new_embeddings)

        if len(partial_embeddings) != len(patient_journeys):
            raise Exception("Everything was successful, but not all embeddings were generated.", "Attaching Partial Embeddings", partial_embeddings)
        
    except Exception as e:
        # Merge the created embeddings from the exception with the existing partial_embeddings
        if hasattr(e, 'args') and len(e.args) > 2 and e.args[1] == "Attaching Partial Embeddings" and isinstance(e.args[2], list):
            partial_embeddings.extend(e.args[2])

            # Save the merged embeddings to the file
            save_partial_embeddings_to_file(partial_embeddings, partial_results_file)

            print(f"⚠️ An exception occurred during embeddings generation: {e.args[0]}, the attempt is resumable with the same hash ({journeys_hash}).")
            raise Exception(f"An exception occurred during embeddings generation: {e.args[0]}", "Partial Embeddings Saved")
        else:
            print(f"🚨 An exception occurred during embeddings generation: {e}, the attempt is NOT resumable.")
            raise Exception(f"An exception occurred during embeddings generation: {e}")

    # If we've generated all embeddings, delete the partial results file    
    cleanup_partial_embeddings_file(partial_results_file)

    return partial_embeddings

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

    partial_embeddings = []
    try:
        for i, chunk in enumerate(patient_journey_chunks):
            display_progress(i, num_chunks)
            partial_embeddings.extend(generate_chunk_embeddings(chunk, i, num_chunks))
        
        validate_embeddings_count(partial_embeddings, patient_journeys)
    except Exception as e:
        raise Exception(f"An exception occurred during embeddings generation: {e}", "Attaching Partial Embeddings", partial_embeddings)
    
    return partial_embeddings

# Recover potentially cached embeddings form a previous run
def get_remaining_journeys_and_cached_embeddings_from_file(patient_journeys: list[str], partial_results_file: str) -> dict:
    # Try to load partial results if they exist
    partial_embeddings = []
    
    if os.path.exists(partial_results_file):
        with open(partial_results_file, 'r') as file:
            partial_embeddings = json.load(file)
            print(f"📂 Resuming from previously created embeddings ({len(partial_embeddings)}/{len(patient_journeys)}) in file: {partial_results_file}")

    # Calculate the starting index based on the number of embeddings already generated
    start_index = len(partial_embeddings)

    # Only process the remaining patient journeys
    return {
        "partial_embeddings": partial_embeddings,
        "remaining_patient_journeys": patient_journeys[start_index:]
    }

def save_partial_embeddings_to_file(partial_embeddings: list[list[float]], partial_results_file: str):
    # Save the merged embeddings to the file
    with open(partial_results_file, 'w') as file:
        json.dump(partial_embeddings, file)

def cleanup_partial_embeddings_file(partial_results_file: str): 
    if os.path.exists(partial_results_file):
        os.remove(partial_results_file)
        print(f"🧹 Cleaned up partial embeddings file: {partial_results_file}")

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



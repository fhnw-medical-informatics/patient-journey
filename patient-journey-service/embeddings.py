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

def create_embeddings_for_chunk(chunk: list[str], model: str = "text-embedding-ada-002"):
    embeddings_response = openaiAPI.embeddings.create(
        model=model,
        input=chunk
    )

    if embeddings_response and len(embeddings_response.data) > 0 and len(embeddings_response.data) == len(chunk):
        embeddings: list[list[float]] = []

        for embedding in embeddings_response.data:
            embeddings.append(embedding.embedding)

        return embeddings
    
    raise Exception("An error occurred while generating embeddings.")


def create_embeddings(patient_journeys: list[str]):
    chunks = create_patient_journeys_chunks(patient_journeys, MODEL, TOKENS_PER_CHUNK)
    
    patient_journey_chunks: list[list[str]] = chunks['patient_journey_chunks']
    total_nr_of_tokens: int = chunks['total_nr_of_tokens']
    total_nr_of_chunks: int = len(patient_journey_chunks)

    print(f"🧩 Generating embeddings using the `{MODEL}` model.")
    print(f"Patient Journeys: {len(patient_journeys)}")
    print(f"Chunks: {total_nr_of_chunks}")
    print(f"Tokens: {total_nr_of_tokens}")
    estimated_cost = (total_nr_of_tokens / 1000) * EMBEDDINGS_API_COSTS_PER_1KTOKENS
    print(f"====================\n💸 Estimated costs: ${estimated_cost:.4f}\n====================")
    print()

    patient_journey_embeddings: list[list[float]] = []

    for index, chunk in enumerate(patient_journey_chunks):
        progress = (index + 1) / total_nr_of_chunks
        progress_bar = ('#' * int(progress * 20)).ljust(20)
        print(f"\r[{progress_bar}] Chunk {index + 1}/{total_nr_of_chunks} being sent to openai embeddings api.", end='')

        try:
            chunk_embeddings = create_embeddings_for_chunk(chunk, MODEL)
            patient_journey_embeddings.extend(chunk_embeddings)

        except Exception as e:
            print(f"\nAn error occurred while generating embeddings for chunk {index + 1} of {total_nr_of_chunks}: {e}")
            raise e
    
    print()
    print()
    print(f"✅ Finished generating {len(patient_journey_embeddings)} embeddings for {total_nr_of_chunks} chunks.")
    print()

    if len(patient_journey_embeddings) != len(patient_journeys):
        print(f"Number of embeddings generated ({len(patient_journey_embeddings)}) does not match the number of patient journeys ({len(patient_journeys)}).")
        raise Exception("Not all embeddings were generated.")

    return patient_journey_embeddings



import os
import json

def load_partial_embeddings_from_file(partial_results_file: str) -> list[list[float]]:
    partial_embeddings = []
    
    if os.path.exists(partial_results_file):
        with open(partial_results_file, 'r') as file:
            partial_embeddings = json.load(file)

    return partial_embeddings

def save_partial_embeddings_to_file(partial_embeddings: list[list[float]], partial_results_file: str):
    # Save the merged embeddings to the file
    with open(partial_results_file, 'w') as file:
        json.dump(partial_embeddings, file)

def cleanup_partial_embeddings_file(partial_results_file: str): 
    if os.path.exists(partial_results_file):
        os.remove(partial_results_file)
        print(f"🧹 Cleaned up partial embeddings file: {partial_results_file}")
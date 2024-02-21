from flask import Flask, request, jsonify
from datetime import datetime
from embeddings import create_embeddings
from process import process_embeddings
from cache import load_partial_embeddings_from_file, save_partial_embeddings_to_file, cleanup_partial_embeddings_file

app = Flask(__name__)

@app.route('/process', methods=['POST'])
def process_data():
    try:
        # Extract data from request
        data = request.get_json()
        
        patient_journeys = data['patient_journeys']
        journeys_hash = data['journeys_hash']

        # Check if patient_journeys is a list of strings
        if not isinstance(patient_journeys, list):
            raise ValueError("patient_journeys should be a list of strings.")
        if not all(isinstance(journey, str) for journey in patient_journeys):
            raise ValueError("All items in patient_journeys should be strings.")
        
        # Check if journeys_hash is a string
        if not journeys_hash or not isinstance(journeys_hash, str):
            raise ValueError("journeys_hash should be a valid string.")

        start_time = datetime.now()
        start_title = f"Processing {len(patient_journeys)} Patient Journeys"

        print()
        print("⬇️" * len(start_title))
        print(start_title)
        print()
        print(f"Start time: {start_time}")
        print()
        print("Step 1/2: Generating Embeddings")
        print("*******************************")
        print()

        # Load embeddings from file if they exist
        embeddings_file = f"embeddings_{journeys_hash}.json"
        embeddings = load_partial_embeddings_from_file(embeddings_file)

        if embeddings:
            print(f"⚠️ Skipping embeddings creation. Loaded {len(embeddings)} embeddings from cache: {embeddings_file}")
        else:
            try: 
                embeddings = create_embeddings(patient_journeys, journeys_hash)
            except Exception as e:
                return jsonify({
                        'status': 'partial_error',
                        'message': f"{e}"
                    })
            
            # Save successfully generated embeddings to file
            print()
            print(f"💾 Saving {len(embeddings)} embeddings to file ({embeddings_file})…")
            save_partial_embeddings_to_file(embeddings, embeddings_file)

        print()
        print("Step 2/2: TSNE and Clustering")
        print("*****************************")
        print()
        
        result = process_embeddings(embeddings)

        # If we've generated everything successfully, delete the partial results file
        print()
        cleanup_partial_embeddings_file(embeddings_file)

        end_time = datetime.now()
        time_elapsed = end_time - start_time

        print()
        print(f"End time: {end_time}")
        print()
        print(f"🎉 Done in {time_elapsed}")
        print()

        return jsonify({
            'status': 'success',
            'patientDataEmbeddings': embeddings,
            'reducedEmbeddings': result['reduced_embeddings'],
            'clusters': result['clusters']
        })
    except Exception as e:
        print(f"🚨 An error occurred: {e}")
        return jsonify({
            'status': 'error',
            'message': f"{e}"
        })

if __name__ == '__main__':
    app.run(debug=True)

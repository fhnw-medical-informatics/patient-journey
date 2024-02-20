# import json
from flask import Flask, request, jsonify
from embeddings import resumable_create_embeddings
from process import process_embeddings

app = Flask(__name__)

@app.route('/process', methods=['POST'])
def process_data():
    # Extract data from request
    data = request.get_json()
    
    patient_journeys = data['patient_journeys']
    journeys_hash = data['journeys_hash']

    # Check if patient_journeys is a list of strings
    if not isinstance(patient_journeys, list):
        raise ValueError("patient_journeys should be a list of strings.")
    if not all(isinstance(journey, str) for journey in patient_journeys):
        raise ValueError("All items in patient_journeys should be strings.")

    print()
    print("⚙️ Processing Patient Journeys")
    print("Step 1/2: Generating Embeddings")

    try: 
        embeddings = resumable_create_embeddings(patient_journeys, journeys_hash)
    except Exception as e:
        if hasattr(e, 'args') and len(e.args) > 1 and e.args[1] == "Partial Embeddings Saved":
            return jsonify({
                'status': 'error',
                'message': f"An exception occurred during embeddings generation: {e}. The partially generated embeddings have been saved and the attempt is resumable with the same input data and hash ({journeys_hash})."
            })
        else:
            return jsonify({
                'status': 'error',
                'message': f"An exception occurred during embeddings generation: {e}. The attempt is not resumable."
            })
    
    # Save embeddings to a temporary JSON file (in case an error happens during tsne and clustering)
    # with open('embeddings.json', 'w') as f:
    #     f.write(json.dumps(embeddings))

    print("Step 2/2: TSNE and Clustering")
    
    result = process_embeddings(embeddings)

    print()
    print("🎉 Done!")
    print()

    return jsonify({
        'status': 'success',
        'patientDataEmbeddings': embeddings,
        'reducedEmbeddings': result['reduced_embeddings'],
        'clusters': result['clusters']
    })

if __name__ == '__main__':
    app.run(debug=True)

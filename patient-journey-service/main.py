# import json
from flask import Flask, request, jsonify
from embeddings import create_embeddings
from process import process_embeddings

app = Flask(__name__)

@app.route('/process', methods=['POST'])
def process_data():
    # Extract data from request
    data = request.get_json()
    
    patient_journeys = data['patient_journeys']

    # Check if patient_journeys is a list of strings
    if not isinstance(patient_journeys, list):
        raise ValueError("patient_journeys should be a list of strings.")
    if not all(isinstance(journey, str) for journey in patient_journeys):
        raise ValueError("All items in patient_journeys should be strings.")

    print()
    print("⚙️ Processing Patient Journeys")
    print("Step 1/2: Generating Embeddings")

    embeddings = create_embeddings(patient_journeys)
    
    # Save embeddings to a temporary JSON file
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

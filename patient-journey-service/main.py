from flask import Flask, request, jsonify
import numpy as np
from sklearn.manifold import TSNE
from sklearn.cluster import KMeans

app = Flask(__name__)

@app.route('/process', methods=['POST'])
def process_data():
    # Extract data from request
    data = request.get_json()
    
    embeddings = np.array(data['embeddings'])

    n_samples = embeddings.shape[0]  # Number of samples

    if (n_samples < 2):
        return jsonify({
            'status': 'error',
            'message': 'Number of samples must be greater than 1'
        })

    # TSNE Dimensionality Reduction
    perplexity_value = min(30, max(n_samples - 1, 1)) # Perplexity value must be smaller than number of samples
    reduced_embeddings = TSNE(n_components=2, perplexity=perplexity_value).fit_transform(embeddings)
    
    # K-Means Clustering
    n_clusters = min(5, max(n_samples, 1))  # Define the number of clusters
    kmeans = KMeans(n_clusters=n_clusters)
    clusters = kmeans.fit_predict(reduced_embeddings)

    return jsonify({
        'status': 'success',
        'reducedEmbeddings': reduced_embeddings.tolist(),
        'clusters': clusters.tolist()
    })

if __name__ == '__main__':
    app.run(debug=True)

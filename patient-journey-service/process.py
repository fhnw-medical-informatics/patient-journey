import numpy as np
from sklearn.manifold import TSNE
from sklearn.cluster import KMeans

def process_embeddings(embeddings: list[list[float]]):
    embeddings = np.array(embeddings)

    n_samples = embeddings.shape[0]  # Number of samples

    if (n_samples < 2):
        raise ValueError('Number of samples must be greater than 1')

    # TSNE Dimensionality Reduction
    print("♻️ Reducing dimensionality using TSNE...")
    perplexity_value = min(30, max(n_samples - 1, 1)) # Perplexity value must be smaller than number of samples
    reduced_embeddings = TSNE(n_components=2, perplexity=perplexity_value).fit_transform(embeddings)
    
    # K-Means Clustering
    print("🫧 Clustering using K-Means...")
    n_clusters = min(5, max(n_samples, 1))  # Define the number of clusters
    kmeans = KMeans(n_clusters=n_clusters)
    clusters = kmeans.fit_predict(reduced_embeddings)

    return {
        'reduced_embeddings': reduced_embeddings.tolist(),
        'clusters': clusters.tolist()
    }
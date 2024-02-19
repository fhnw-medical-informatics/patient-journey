# A Python Service for dimensionality reduction and clustering

This service is part of the patient journey project. It is responsible for dimensionality reduction and clustering of patient journey data embeddings.

## Prerequisites

- Python 3.3 or higher
- pip

## Installation

Setup a virtual environment and install the required packages:

```bash
python3 -m venv sandbox
source sandbox/bin/activate
pip install -r requirements.txt
```

## IDE Setup

Select the `sandbox` virtual environment as the Python interpreter in your IDE.

Interpreter Path: `./patient-journey-service/sandbox/bin/python3`

## Testing

With the virtual environment activated, run the tests:

```bash
pytest
```

## Usage

With the virtual environment activated, run the service:

```bash
python3 main.py
```

## Making requests

The service listens on port 5000. You can make requests to the service using the following endpoint:

```
POST /process
```

The request body should contain a JSON object with the following fields:

- `embeddings`: A list of patient journey data embeddings (Array<Array<number>>)

The response will be a JSON object with the following fields:

- `reducedEmbeddings`: The reduced embeddings (Array<[number, number]>)
- `clusters`: The cluster assignments (Array<number>)

import React, { useCallback } from 'react'

import SimilarityProviderSelectorComponent, { Option } from '../components/SimilarityProviderSelector'

import { useActiveSimilarityProvier, useIndexPatientId } from '../hooks'
import { useAppDispatch } from '../../store'
import { SimilarityProvider, setSimilarityProvider } from '../dataSlice'
import { PatientIdNone } from '../patients'

const SimilarityProviderSelector = () => {
  const similarityProvider = useActiveSimilarityProvier()
  const indexPatient = useIndexPatientId()
  const dispatch = useAppDispatch()

  const handleSimilarityProviderChange = useCallback(
    (similarityProvider: SimilarityProvider) => {
      dispatch(setSimilarityProvider(similarityProvider))
    },
    [dispatch]
  )

  const options: Option[] = [
    { label: 'Similarty Matrix', value: 'matrix' },
    { label: 'GPT-3 Embeddings', value: 'embeddings' },
  ]

  return (
    <SimilarityProviderSelectorComponent
      options={options}
      selectedOption={similarityProvider}
      onChange={handleSimilarityProviderChange}
      show={indexPatient !== PatientIdNone}
    />
  )
}

export default SimilarityProviderSelector
